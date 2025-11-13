"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="text-6xl mb-4 opacity-50">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}


