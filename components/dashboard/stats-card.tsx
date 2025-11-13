"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'violet';
  progress?: number;
  subtitle?: string;
  className?: string;
}

const colorVariants = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-500",
    text: "text-blue-100",
    progress: "bg-blue-400/30",
  },
  emerald: {
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-500",
    text: "text-emerald-100",
    progress: "bg-emerald-400/30",
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500",
    text: "text-amber-100",
    progress: "bg-amber-400/30",
  },
  violet: {
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500",
    text: "text-violet-100",
    progress: "bg-violet-400/30",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  progress,
  subtitle,
  className,
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "bg-gradient-to-br text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full",
        colors.gradient
      )}>
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className={cn("text-sm font-medium flex items-center gap-2", colors.text)}>
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold mb-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {progress !== undefined && (
            <Progress 
              value={Math.min(100, progress)} 
              className={cn("h-2 mb-2", colors.progress)} 
            />
          )}
          
          {subtitle && (
            <p className={cn("text-xs mt-2", colors.text)}>
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs mt-2",
              trend.isPositive ? "text-green-200" : "text-red-200"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}


