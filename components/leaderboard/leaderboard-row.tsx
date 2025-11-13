"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  points: number;
  weeklyPoints: number;
  totalCoins?: number;
  streak?: number;
  isCurrentUser?: boolean;
  avatar?: string;
  className?: string;
}

const getRankEmoji = (rank: number) => {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return `${rank}️⃣`;
  return "🎯";
};

const getRankStyles = (rank: number) => {
  if (rank === 1) {
    return "bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-md";
  }
  if (rank === 2) {
    return "bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 shadow-md";
  }
  if (rank === 3) {
    return "bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 shadow-md";
  }
  return "bg-gradient-to-r from-white to-slate-50 border border-slate-200";
};

export function LeaderboardRow({
  rank,
  name,
  points,
  weeklyPoints,
  totalCoins,
  streak,
  isCurrentUser,
  avatar,
  className,
}: LeaderboardRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg",
        getRankStyles(rank),
        isCurrentUser && "ring-2 ring-blue-500 ring-offset-2",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getRankEmoji(rank)}</span>
          <div className="text-center min-w-[50px]">
            <div className={cn(
              "text-xl font-bold",
              rank === 1 ? "text-yellow-600" :
              rank === 2 ? "text-gray-600" :
              rank === 3 ? "text-orange-600" : "text-slate-700"
            )}>
              #{rank}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg text-slate-800">
              {name}
            </p>
            {isCurrentUser && (
              <Badge className="bg-blue-500 text-white text-xs">
                You
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
            {streak !== undefined && streak > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-orange-500">🔥</span>
                {streak} day streak
              </span>
            )}
            {totalCoins !== undefined && (
              <span className="flex items-center gap-1">
                <span className="text-emerald-500">💰</span>
                ₽{Number(totalCoins).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-800">
          {points.toLocaleString()}
        </div>
        <p className="text-sm text-slate-600">
          <span className="text-green-600 font-medium">+{weeklyPoints || 0}</span> this week
        </p>
      </div>
    </motion.div>
  );
}


