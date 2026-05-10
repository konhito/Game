"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Play, CircleDollarSign } from "lucide-react";
import { dashboardService } from "@/lib/dashboard-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const wheelSegments = [
  { id: 1, label: "200", points: 200, color: "#f59e0b" }, // amber-500
  { id: 2, label: "500", points: 500, color: "#ef4444" }, // red-500
  { id: 3, label: "10", points: 10, color: "#3b82f6" },  // blue-500
  { id: 4, label: "25", points: 25, color: "#10b981" },  // emerald-500
  { id: 5, label: "50", points: 50, color: "#8b5cf6" },  // violet-500
  { id: 6, label: "100", points: 100, color: "#ec4899" }, // pink-500
];

export function MiniSpinWheel({ onSpinComplete }: { onSpinComplete: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinsRemaining, setSpinsRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => {
    const fetchSpins = async () => {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      if (user.id) {
        const statsResponse = await dashboardService.getUserStats(user.id);
        if (statsResponse.success) {
          setSpinsRemaining(statsResponse.data.users[0]?.spins_remaining || 0);
        }
      }
    };
    fetchSpins();
  }, []);

  const spinWheel = async () => {
    if (spinsRemaining <= 0 || isSpinning) return;

    try {
      setIsSpinning(true);
      setError(null);
      setLastWin(null);

      const segmentProbabilities = wheelSegments.map(seg => {
        if (seg.points === 10) return 0.70;
        if (seg.points === 25) return 0.20;
        if (seg.points === 50) return 0.08;
        if (seg.points === 100) return 0.015;
        if (seg.points === 200) return 0.004;
        if (seg.points === 500) return 0.001;
        return 0;
      });

      const random = Math.random();
      let cumulativeProbability = 0;
      let selectedSegmentIndex = 0;
      
      for (let i = 0; i < segmentProbabilities.length; i++) {
        cumulativeProbability += segmentProbabilities[i];
        if (random <= cumulativeProbability) {
          selectedSegmentIndex = i;
          break;
        }
      }

      const selectedSegment = wheelSegments[selectedSegmentIndex];
      const segmentAngle = 360 / wheelSegments.length;
      const segmentStartAngle = selectedSegmentIndex * segmentAngle - 90;
      let segmentCenterAngle = segmentStartAngle + (segmentAngle / 2);
      
      while (segmentCenterAngle < 0) segmentCenterAngle += 360;
      while (segmentCenterAngle >= 360) segmentCenterAngle -= 360;
      
      const targetPosition = (270 - segmentCenterAngle + 360) % 360;
      const currentPosition = rotation % 360;
      let additionalRotation = (targetPosition - currentPosition + 360) % 360;
      
      if (additionalRotation < 30) additionalRotation += 360;
      
      const baseSpins = 4 + Math.random() * 2;
      const baseRotation = Math.floor(baseSpins) * 360;
      const segmentOffset = (Math.random() - 0.5) * (segmentAngle * 0.2);
      const finalRotation = baseRotation + additionalRotation + segmentOffset;

      setRotation(prev => prev + finalRotation);

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const coins = Math.round(selectedSegment.points * 0.001 * 100) / 100;
      const updateResponse = await dashboardService.updateUserStatsAfterSpin(selectedSegment.points, coins);
      
      if (updateResponse.success) {
        setSpinsRemaining(prev => prev - 1);
        setLastWin(selectedSegment.points);
        onSpinComplete();
      } else {
        setError(updateResponse.error || 'Failed to update stats');
      }
    } catch (err) {
      setError('Spin failed. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <Card className="border-slate-200/50 bg-white/90 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-white/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-slate-700" />
          Daily Spin
        </CardTitle>
        <CardDescription>
          {spinsRemaining > 0 ? `${spinsRemaining} spins available` : "No spins remaining today"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-6 flex-1 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-800 drop-shadow-md"></div>
          </div>
          
          <div 
            className="w-full h-full rounded-full shadow-inner border-[4px] border-slate-100"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full rounded-full">
              {wheelSegments.map((segment, index) => {
                const segmentAngle = 360 / wheelSegments.length;
                const startAngle = index * segmentAngle - 90;
                const endAngle = startAngle + segmentAngle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                
                const largeArc = segmentAngle > 180 ? 1 : 0;
                const midAngle = startAngle + segmentAngle / 2;
                const midRad = (midAngle * Math.PI) / 180;
                const textX = 100 + 60 * Math.cos(midRad);
                const textY = 100 + 60 * Math.sin(midRad);
                
                return (
                  <g key={segment.id}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="16"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="16" fill="#ffffff" shadow="md" />
              <circle cx="100" cy="100" r="12" fill="#f1f5f9" />
            </svg>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-3 text-center">{error}</p>}
        {lastWin && !isSpinning && !error && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-emerald-600 mb-3 text-center"
          >
            You won {lastWin} points!
          </motion.p>
        )}

        <Button 
          onClick={spinWheel}
          disabled={spinsRemaining <= 0 || isSpinning}
          className={`w-full max-w-[200px] transition-all ${
            spinsRemaining > 0 && !isSpinning
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          {isSpinning ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Spinning...</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Spin Wheel</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
