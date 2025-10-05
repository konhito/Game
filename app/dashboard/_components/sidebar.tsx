"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Trophy, 
  Gamepad2, 
  Wallet, 
  Users, 
  Gift, 
  Target, 
  Settings, 
  Menu,
  BarChart3,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  userStats?: {
    spins_remaining?: number;
    current_streak?: number;
    total_points?: number;
  } | null;
}

export function Sidebar({ className, userStats }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
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
      title: "Leaderboard",
      href: "/dashboard/leaderboard",
      icon: Trophy,
      isActive: pathname === "/dashboard/leaderboard",
    },
    {
      title: "Daily Rewards",
      href: "/dashboard/daily-rewards",
      icon: Target,
      isActive: pathname === "/dashboard/daily-rewards",
    },
    {
      title: "Activities",
      href: "/dashboard/activities",
      icon: Target,
      isActive: pathname === "/dashboard/activities",
    },
    {
      title: "Rewards",
      href: "/dashboard/rewards",
      icon: Gift,
      isActive: pathname === "/dashboard/rewards",
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
      isActive: pathname === "/dashboard/wallet",
    },
    {
      title: "Referrals",
      href: "/dashboard/referrals",
      icon: Users,
      isActive: pathname === "/dashboard/referrals",
    },
    {
      title: "Statistics",
      href: "/dashboard/stats",
      icon: BarChart3,
      isActive: pathname === "/dashboard/stats",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      isActive: pathname === "/dashboard/settings",
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-4 bg-gradient-to-r from-background to-muted/20">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            🎯
          </div>
          <span className="text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            PineCoin Media
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <span
                className={cn(
                  "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                  item.isActive 
                    ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-700 border border-emerald-200/50 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 transition-colors",
                  item.isActive ? "text-emerald-600" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium">{item.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      {/* Quick Stats */}
      <div className="p-4 border-t bg-gradient-to-b from-muted/20 to-transparent">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Quick Stats
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Daily Streak
              </span>
              <span className="font-semibold text-orange-600">🔥 {userStats?.current_streak || 0} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Spins Left
              </span>
              <span className="font-semibold text-blue-600">🎯 {userStats?.spins_remaining || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Total Points
              </span>
              <span className="font-semibold text-green-600">{userStats?.total_points || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pl-1 pr-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-background/95 lg:backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:border-r lg:shadow-sm">
        <SidebarContent />
      </div>
      <div className="hidden lg:block lg:w-64" />
    </>
  );
}
