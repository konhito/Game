"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Coins, LogOut, Settings, User, Wallet, Menu, Home, Trophy, Gamepad2, Gift, Target, BarChart3, Shield, Newspaper } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import config from "@/lib/config";
import { coinEventEmitter } from "@/lib/coin-event-emitter";

interface User {
  name: string;
  email: string;
  avatar: string | null;
  pineCoins: number;
  weeklyPoints: number;
  role?: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real user stats from backend
  const fetchUserStats = async (userId: number) => {
    try {
      console.log('Navbar: Fetching user stats for user ID:', userId);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Navbar: No auth token found');
        return;
      }

      const response = await fetch(`${config.API_BASE}/api/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Navbar: User stats response:', result);
        
        if (result.success && result.data && result.data.user) {
          const userStats = result.data.user;
          setUser(prevUser => ({
            ...prevUser,
            name: prevUser?.name || "Player",
            email: prevUser?.email || "player@example.com",
            avatar: prevUser?.avatar || null,
            role: prevUser?.role || "user",
            pineCoins: parseFloat(userStats.total_coins) || 0,
            weeklyPoints: userStats.weekly_points || 0
          }));
          console.log('Navbar: Updated user with real stats:', userStats);
        }
      } else {
        console.error('Navbar: Failed to fetch user stats:', response.status);
      }
    } catch (error) {
      console.error('Navbar: Error fetching user stats:', error);
    }
  };

  // Simplified navigation - only essential items
  const navigation: Array<{
    title: string;
    href: string;
    icon: any;
    isActive: boolean;
    isAdmin?: boolean;
  }> = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      title: "News",
      href: "/news",
      icon: Newspaper,
      isActive: pathname === "/news",
    },
    {
      title: "Tasks",
      href: "/dashboard/activities",
      icon: Target,
      isActive: pathname === "/dashboard/activities",
    },
    {
      title: "Prize Pools",
      href: "/dashboard/prize-pool",
      icon: Gift,
      isActive: pathname === "/dashboard/prize-pool",
    },
    {
      title: "Rewards",
      href: "/dashboard/rewards",
      icon: Gift,
      isActive: pathname === "/dashboard/rewards",
    },
  ];

  const isAdmin = user?.role === "admin";

  // Add admin panel navigation if user is admin
  const adminNavigation = isAdmin ? [
    {
      title: "Admin",
      href: "/admin",
      icon: Shield,
      isActive: pathname === "/admin",
      isAdmin: true,
    }
  ] : [];

  // Combine regular and admin navigation
  const allNavigation = [...navigation, ...adminNavigation];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first (most reliable and complete)
        let token: string | null = null;
        let userStr: string | null = null;
        try {
          if (typeof localStorage !== 'undefined') {
            // Test if localStorage works
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            token = localStorage.getItem('auth_token');
            userStr = localStorage.getItem('auth_user');
          }
        } catch (e) {
          console.warn('Navbar: localStorage not available:', e);
        }
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('Navbar: Found complete user data in localStorage:', userData);
            setUser({
              name: userData.name || userData.email?.split('@')[0] || "Player",
              email: userData.email || "player@example.com",
              avatar: userData.image || null,
              pineCoins: 0, // Will be updated from real data
              weeklyPoints: 0, // Will be updated from real data
              role: userData.role || "user",
            });
            
            // Fetch real user stats from backend
            await fetchUserStats(userData.id);
            return;
          } catch (error) {
            console.error('Navbar: Error parsing localStorage user data:', error);
          }
        }
        
        // Fallback to cookies if localStorage is empty (minimal data only)
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(cookie => 
          cookie.trim().startsWith('custom_auth_token=')
        );
        const userDataCookie = cookies.find(cookie => 
          cookie.trim().startsWith('custom_user_data=')
        );
        
        if (authTokenCookie && userDataCookie) {
          try {
            const token = decodeURIComponent(authTokenCookie.split('=')[1]);
            const userDataStr = decodeURIComponent(userDataCookie.split('=')[1]);
            
            console.log('Navbar: Using cookie data (minimal):', userDataStr);
            
            const userData = JSON.parse(userDataStr);
            setUser({
              name: userData.name || userData.email?.split('@')[0] || "Player",
              email: userData.email || "player@example.com",
              avatar: userData.image || null,
              pineCoins: 0, // Will be updated from real data
              weeklyPoints: 0, // Will be updated from real data
              role: userData.role || "user",
            });
            
            // Fetch real user stats from backend
            await fetchUserStats(userData.id);
            return;
          } catch (parseError) {
            console.error('Navbar: Failed to parse cookie data:', parseError);
          }
        }
        
        // If both localStorage and cookies fail, redirect to login
        console.log('Navbar: No valid authentication found, redirecting to sign-in');
        router.push('/sign-in');
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  // Listen for coin updates from other components
  useEffect(() => {
    const unsubscribe = coinEventEmitter.onCoinUpdate((data) => {
      console.log('Navbar: Received coin update:', data);
      setUser(prevUser => prevUser ? {
        ...prevUser,
        pineCoins: data.pineCoins,
        weeklyPoints: data.weeklyPoints
      } : null);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    try {
      // Clear custom auth cookies
      document.cookie = 'custom_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'custom_user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear localStorage if it exists
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
      
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <header 
        className="relative z-50 border-b border-slate-200/50 backdrop-blur-md bg-white/70 sticky top-0 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">₽</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              PineCrest
              </span>
            </div>
            
            {/* Loading State */}
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-xl"></div>
              <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <header 
      className="relative z-50 border-b border-slate-200/50 backdrop-blur-md bg-white/70 sticky top-0 shadow-sm w-full overflow-x-hidden"
      data-tour="navbar"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 w-full">
        <div className="flex items-center justify-between py-4 sm:py-6 gap-2 sm:gap-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex-shrink-0">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/Icon.png" 
                  alt="PineCrest Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent whitespace-nowrap">
                PineCrest
              </span>
            </div>
          </Link>

          {/* Clean Navigation - Only Essential Items */}
          <nav
            className={`hidden xl:flex flex-1 flex-nowrap items-center justify-center gap-1.5 mx-auto min-w-0 overflow-x-auto scrollbar-hide ${
              isAdmin ? "max-w-4xl" : "max-w-3xl"
            }`}
          >
            {allNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.href === "/dashboard/activities" ? "nav-activities" : 
                          item.href === "/dashboard/rewards" ? "nav-rewards" :
                          item.href === "/dashboard/prize-pool" ? "nav-prize-pool" :
                          item.href === "/dashboard/settings" ? "nav-settings" : undefined}
                className={`relative shrink-0 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  isAdmin
                    ? "px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-[11px] lg:text-[12px]"
                    : "px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm"
                } ${
                  item.isActive
                    ? item.isAdmin 
                      ? "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 hover:shadow-md hover:scale-105"
                      : "text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:scale-105"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm hover:scale-105"
                }`}
              >
                <div className="flex items-center gap-1.5 lg:gap-2.5">
                  <item.icon className={`flex-shrink-0 transition-all duration-200 ${
                    isAdmin ? "h-3.5 w-3.5 lg:h-4 lg:w-4" : "h-4 w-4 lg:h-5 lg:w-5"
                  } ${
                    item.isActive 
                      ? item.isAdmin ? "text-red-600 hover:text-red-700 hover:scale-110" : "text-emerald-600 hover:text-emerald-700 hover:scale-110"
                      : "text-slate-500 hover:text-emerald-600 hover:scale-110"
                  }`} />
                  <span className="font-semibold">{item.title}</span>
                </div>
                {item.isActive && (
                  <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                    item.isAdmin ? "bg-red-500" : "bg-emerald-500"
                  }`}></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side - Clean and Simple */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Quick Stats - PineCoins and Weekly Points - Desktop */}
            <div className="hidden xl:flex items-center space-x-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 shadow-sm hover:bg-yellow-100 hover:border-yellow-300 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Coins className="w-4 h-4 text-yellow-600 flex-shrink-0 hover:text-yellow-700 hover:scale-110 transition-all duration-200" />
                <span className="font-semibold text-yellow-800 whitespace-nowrap hover:text-yellow-900 transition-colors duration-200">
                  {user.pineCoins === 0 && loading ? '...' : `₽${user.pineCoins.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 shadow-sm hover:bg-blue-100 hover:border-blue-300 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Target className="w-4 h-4 text-blue-600 flex-shrink-0 hover:text-blue-700 hover:scale-110 transition-all duration-200" />
                <span className="font-semibold text-blue-800 whitespace-nowrap hover:text-blue-900 transition-colors duration-200">
                  {user.weeklyPoints === 0 && loading ? '...' : `${user.weeklyPoints} wk`}
                </span>
              </div>
            </div>

            {/* Quick Stats - Mobile - Compact */}
            <div className="xl:hidden flex items-center space-x-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 shadow-sm hover:bg-yellow-100 hover:border-yellow-300 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Coins className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 hover:text-yellow-700 hover:scale-110 transition-all duration-200" />
                <span className="font-semibold text-yellow-800 text-xs whitespace-nowrap hover:text-yellow-900 transition-colors duration-200">
                  {user.pineCoins === 0 && loading ? '...' : `₽${user.pineCoins.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-200 shadow-sm hover:bg-blue-100 hover:border-blue-300 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Target className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 hover:text-blue-700 hover:scale-110 transition-all duration-200" />
                <span className="font-semibold text-blue-800 text-xs whitespace-nowrap hover:text-blue-900 transition-colors duration-200">
                  {user.weeklyPoints === 0 && loading ? '...' : `${user.weeklyPoints} wk`}
                </span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="xl:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 hover:text-slate-900 rounded-xl hover:scale-110 active:scale-95 transition-all duration-200">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[92vw] max-w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Navigation Menu</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Quick access to dashboard sections
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allNavigation.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                      {item.isActive && (
                        <div className={`ml-auto w-2 h-2 rounded-full ${
                          item.isAdmin ? "bg-red-500" : "bg-emerald-500"
                        }`}></div>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu - Everything Else Goes Here */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all duration-200 p-0 flex-shrink-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 hover:ring-2 hover:ring-slate-300 transition-all duration-200">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[92vw] max-w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2 p-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div className="text-center">
                        <div className="text-sm font-bold text-emerald-600">{user.weeklyPoints || 0}</div>
                        <div className="text-xs text-slate-500">Weekly Pts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-blue-600">{user.pineCoins || 0}</div>
                        <div className="text-xs text-slate-500">Coins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-purple-600">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</div>
                        <div className="text-xs text-slate-500">Level</div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* All Navigation Items */}
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                  <Link href="/dashboard/leaderboard" className="flex items-center gap-3 w-full">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span>Leaderboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                    <Link href="/dashboard/rewards" className="flex items-center gap-3 w-full">
                      <Target className="h-4 w-4 text-purple-600" />
                    <span className="truncate">Rewards</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                    <Link href="/dashboard/prize-pool" className="flex items-center gap-3 w-full">
                      <Gift className="h-4 w-4 text-pink-600" />
                    <span className="truncate">Prize Pools</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                    <Link href="/news" className="flex items-center gap-3 w-full">
                      <Newspaper className="h-4 w-4 text-orange-600" />
                    <span className="truncate">News</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                    <Link href="/dashboard/wallet" className="flex items-center gap-3 w-full">
                      <Wallet className="h-4 w-4 text-blue-600" />
                    <span className="truncate">Wallet</span>
                  </Link>
                </DropdownMenuItem>
                {/* Profile Section */}
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                  <Link href="/user" className="flex items-center gap-3 w-full">
                    <User className="h-4 w-4 text-emerald-600" />
                    <div className="flex flex-col">
                      <span>My Profile</span>
                      <span className="text-xs text-slate-500">View stats & activities</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                  <Link href="/dashboard/activities" className="flex items-center gap-3 w-full">
                    <Target className="h-4 w-4 text-purple-600" />
                    <div className="flex flex-col">
                      <span>My Activities</span>
                      <span className="text-xs text-slate-500">Task history & progress</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 w-full">
                    <Settings className="h-4 w-4 text-slate-600" />
                    <div className="flex flex-col">
                      <span>Settings</span>
                      <span className="text-xs text-slate-500">Profile, Telegram &amp; account</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
