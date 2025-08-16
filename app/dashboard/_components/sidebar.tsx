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
  TrendingUp,
  Coins,
  Calendar,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
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
      title: "Leaderboard",
      href: "/dashboard/leaderboard",
      icon: Trophy,
      isActive: pathname === "/dashboard/leaderboard",
    },
    {
      title: "Spinning Wheel",
      href: "/dashboard/spin-wheel",
      icon: Gamepad2,
      isActive: pathname === "/dashboard/spin-wheel",
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
      <div className="flex h-[60px] items-center border-b px-2">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            🎯
          </div>
          <span className="text-lg">PineCoin Casino</span>
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
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  item.isActive ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      {/* Quick Stats */}
      <div className="p-3 border-t">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Streak</span>
            <span className="font-medium">🔥 3 days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spins Left</span>
            <span className="font-medium">🎯 3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Points Today</span>
            <span className="font-medium text-green-600">+25</span>
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
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-background lg:border-r">
        <SidebarContent />
      </div>
      <div className="hidden lg:block lg:w-64" />
    </>
  );
}
