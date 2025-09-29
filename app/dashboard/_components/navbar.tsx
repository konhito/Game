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
import { Bell, Coins, LogOut, Settings, User, Wallet, Menu, Home, Trophy, Gamepad2, Gift, Target, BarChart3, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  name: string;
  email: string;
  avatar: string | null;
  pineCoins: number;
  points: number;
  role?: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      title: "Activities",
      href: "/dashboard/activities",
      icon: Target,
      isActive: pathname === "/dashboard/activities",
    },
    {
      title: "Prize Pools",
      href: "/dashboard/prize-pools",
      icon: Gift,
      isActive: pathname === "/dashboard/prize-pools",
    },
  ];

  // Add admin panel navigation if user is admin
  const adminNavigation = user?.role === 'admin' ? [
    {
      title: "Admin Panel",
      href: "/admin",
      icon: Shield,
      isActive: pathname === "/admin",
      isAdmin: true,
    }
  ] : [];

  // Combine regular and admin navigation
  const allNavigation = [...navigation, ...adminNavigation];

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check localStorage first (most reliable and complete)
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('Navbar: Found complete user data in localStorage:', userData);
            setUser({
              name: userData.name || userData.email?.split('@')[0] || "Player",
              email: userData.email || "player@example.com",
              avatar: userData.image || null,
              pineCoins: 125.50, // Mock data - replace with real data
              points: 1250, // Mock data - replace with real data
              role: userData.role || "user",
            });
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
              avatar: null, // Use null since image is not in minimal cookie
              pineCoins: 125.50, // Mock data - replace with real data
              points: 1250, // Mock data - replace with real data
              role: userData.role || "user",
            });
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

  const handleLogout = () => {
    try {
      // Clear custom auth cookies
      document.cookie = 'custom_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'custom_user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear localStorage if it exists
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
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
                PineCoin 
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
      className="relative z-50 border-b border-slate-200/50 backdrop-blur-md bg-white/70 sticky top-0 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-6">
          {/* Logo/Brand */}
          <Link href="/dashboard">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">₽</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                PineCoin
              </span>
            </div>
          </Link>

          {/* Clean Navigation - Only Essential Items */}
          <nav className="hidden md:flex items-center ml-16 space-x-6">
            {allNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  item.isActive
                    ? item.isAdmin 
                      ? "text-red-600 bg-red-50 border border-red-200"
                      : "text-emerald-600 bg-emerald-50 border border-emerald-200"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${
                    item.isActive 
                      ? item.isAdmin ? "text-red-600" : "text-emerald-600"
                      : "text-slate-500"
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
          <div className="ml-auto flex items-center space-x-4">
            {/* Quick Stats - Only Money and Points */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 shadow-sm">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">${user.pineCoins}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
                <div className="w-4 h-4 text-blue-600">🎯</div>
                <span className="font-semibold text-blue-800">{user.points} pts</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
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
                      <span>{item.title}</span>
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
                <Button variant="ghost" className="relative h-12 w-12 rounded-xl hover:bg-slate-100 transition-colors p-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* All Navigation Items */}
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link href="/dashboard/leaderboard" className="flex items-center gap-3 w-full">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span>Leaderboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link href="/dashboard/spin-wheel" className="flex items-center gap-3 w-full">
                    <Gamepad2 className="h-4 w-4 text-purple-600" />
                    <span>Spin Wheel</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link href="/dashboard/wallet" className="flex items-center gap-3 w-full">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <span>Wallet</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link href="/dashboard/stats" className="flex items-center gap-3 w-full">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span>Statistics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 w-full">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link href="/dashboard/profile" className="flex items-center gap-3 w-full">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Notifications */}
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3 w-full">
                    <Bell className="h-4 w-4 text-orange-600" />
                    <span>Notifications</span>
                    <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs bg-red-500 hover:bg-red-600">
                      3
                    </Badge>
                  </div>
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
