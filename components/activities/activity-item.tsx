"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActivityItemProps {
  type: string;
  description: string;
  points: number;
  timestamp: Date;
  icon?: ReactNode;
  className?: string;
}

const getActivityIcon = (type: string): ReactNode => {
  const iconMap: Record<string, string> = {
    daily_login: "🌅",
    wheel_spin: "🎯",
    ad_watch: "👁️",
    referral: "👥",
    challenge: "🏆",
    task_completed: "✅",
    dashboard_view: "📊",
  };
  
  return iconMap[type] || "⭐";
};

export function ActivityItem({
  type,
  description,
  points,
  timestamp,
  icon,
  className,
}: ActivityItemProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 border border-emerald-200/50 hover:border-emerald-300/50 hover:scale-105",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {icon || getActivityIcon(type)}
        </div>
        <div>
          <p className="font-semibold text-slate-800">
            {description || type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {formatTimestamp(timestamp)}
          </p>
        </div>
      </div>
      
      <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium px-3 py-1">
        +{points} points
      </Badge>
    </motion.div>
  );
}


