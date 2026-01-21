"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Target, Clock, RefreshCw } from "lucide-react";
import { dashboardService } from "@/lib/dashboard-service";
import config from "@/lib/config";

const wheelSegments = [
  { 
    id: 1, 
    label: "200", 
    points: 200, 
    color: "#8B5CF6", 
    gradient: "from-purple-500 to-purple-600",
    icon: "👑"
  },
  { 
    id: 2, 
    label: "500", 
    points: 500, 
    color: "#FF2D55", 
    gradient: "from-red-500 to-red-600",
    icon: "🚀"
  },
  { 
    id: 3, 
    label: "10", 
    points: 10, 
    color: "#3B82F6", 
    gradient: "from-blue-500 to-blue-600",
    icon: "🎯"
  },
  { 
    id: 4, 
    label: "25", 
    points: 25, 
    color: "#14B8A6", 
    gradient: "from-teal-500 to-teal-600",
    icon: "💎"
  },
  { 
    id: 5, 
    label: "50", 
    points: 50, 
    color: "#F59E0B", 
    gradient: "from-amber-500 to-amber-600",
    icon: "🍀"
  },
  { 
    id: 6, 
    label: "100", 
    points: 100, 
    color: "#F59E0B", 
    gradient: "from-amber-500 to-amber-600",
    icon: "⭐"
  },
];

const spinPrices = [
  { spins: 3, price: 1, discount: "0%" },
  { spins: 10, price: 2.6, discount: "13%" },
  { spins: 30, price: 6.25, discount: "17%" },
  { spins: 50, price: 8.8, discount: "12%" },
  { spins: 100, price: 15.85, discount: "21%" },
];

export default function SpinWheelPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof wheelSegments[0] | null>(null);
  const [spinsRemaining, setSpinsRemaining] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [nextReset, setNextReset] = useState<{
    nextReset: string;
    currentPeriod: number;
    nextPeriod: number;
    hoursUntilReset: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reset information and user stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch next reset information
        const resetResponse = await fetch(`${config.API_BASE}/api/spin-reset/next-reset`);
        if (resetResponse.ok) {
          const resetData = await resetResponse.json();
          setNextReset(resetData.data);
        }
        
        // Fetch user stats to get current spins
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        if (user.id) {
          const statsResponse = await dashboardService.getUserStats(user.id);
          if (statsResponse.success) {
            setSpinsRemaining(statsResponse.data.users[0]?.spins_remaining || 0);
          }
        }
        
      } catch (err) {
        console.error('Error fetching spin wheel data:', err);
        setError('Failed to load spin wheel data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const spinWheel = async () => {
    if (spinsRemaining <= 0 || isSpinning) return;

    try {
      setIsSpinning(true);
      setShowResult(false);
      setResult(null);
      setError(null);

      // Weighted probabilities favoring low points
      // Map each segment to its probability based on points
      const segmentProbabilities = wheelSegments.map(seg => {
        if (seg.points === 10) return 0.70; // 70% for 10 points
        if (seg.points === 25) return 0.20; // 20% for 25 points
        if (seg.points === 50) return 0.08; // 8% for 50 points
        if (seg.points === 100) return 0.015; // 1.5% for 100 points
        if (seg.points === 200) return 0.004; // 0.4% for 200 points
        if (seg.points === 500) return 0.001; // 0.1% for 500 points
        return 0;
      });

      // Select segment based on weighted probability
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

      // Get the selected segment BEFORE calculating rotation
      const selectedSegment = wheelSegments[selectedSegmentIndex];
      console.log('🎡 Selected segment:', selectedSegment, 'Index:', selectedSegmentIndex);

      // Calculate rotation to land on the selected segment
      const segmentAngle = 360 / wheelSegments.length; // 60 degrees per segment
      
      // Calculate the center angle of the selected segment
      // Each segment starts at: index * segmentAngle - 90 (to start from top)
      // Segment center is at start + half the segment angle
      const segmentStartAngle = selectedSegmentIndex * segmentAngle - 90;
      let segmentCenterAngle = segmentStartAngle + (segmentAngle / 2);
      
      // Normalize segmentCenterAngle to 0-360 range
      while (segmentCenterAngle < 0) segmentCenterAngle += 360;
      while (segmentCenterAngle >= 360) segmentCenterAngle -= 360;
      
      // The pointer is at the TOP of the wheel (270° in standard 0-360, or -90°)
      // When CSS rotates the wheel by R degrees clockwise, a point at angle A moves to A + R
      // We want the segment center to appear at 270° (top where pointer is)
      // So: segmentCenterAngle + totalRotation = 270 (mod 360)
      // Therefore: targetRotation = 270 - segmentCenterAngle (mod 360)
      const targetPosition = (270 - segmentCenterAngle + 360) % 360;
      
      // Account for current rotation to calculate how much more to rotate
      const currentPosition = rotation % 360;
      let additionalRotation = (targetPosition - currentPosition + 360) % 360;
      
      // Ensure we always rotate forward (add at least 360 if additionalRotation is too small)
      if (additionalRotation < 30) {
        additionalRotation += 360;
      }
      
      // Add multiple full spins for dramatic effect
      const baseSpins = 5 + Math.random() * 3; // 5-8 full rotations
      const baseRotation = Math.floor(baseSpins) * 360;
      
      // Add a small random offset within the segment to make it look more natural
      // Keep offset small (±10% of segment = ±6 degrees) to ensure it stays within bounds
      const segmentOffset = (Math.random() - 0.5) * (segmentAngle * 0.2);
      
      const finalRotation = baseRotation + additionalRotation + segmentOffset;

      console.log('🎡 Rotation calculation:', {
        selectedSegmentIndex,
        segmentAngle,
        segmentCenterAngle,
        baseRotation,
        additionalRotation,
        segmentOffset,
        finalRotation
      });

      setRotation(prev => prev + finalRotation);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Update user stats on backend
      // Conversion rate: 1000 points = 1 PineCoin
      const coins = Math.round(selectedSegment.points * 0.001 * 100) / 100;
      const updateResponse = await dashboardService.updateUserStatsAfterSpin(selectedSegment.points, coins);
      
      if (updateResponse.success) {
        setResult(selectedSegment);
        setShowResult(true);
        setSpinsRemaining(prev => prev - 1);
        console.log('✅ Spin successful - Points:', selectedSegment.points, 'Coins:', coins);
      } else {
        setError(updateResponse.error || 'Failed to update stats');
      }
      
    } catch (err) {
      console.error('Error spinning wheel:', err);
      setError('Failed to spin wheel. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  };

  const buySpins = (spins: number, price: number) => {
    // TODO: Implement PineCoin purchase logic
    console.log(`Buying ${spins} spins for ${price} PineCoins`);
    setSpinsRemaining(prev => prev + spins);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-sm sm:text-base">Loading spin wheel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-3 sm:mb-4 animate-pulse px-2">
            🎰 FORTUNE WHEEL 🎰
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-yellow-300 font-semibold px-2">Spin to win massive points and incredible rewards!</p>
          {error && (
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm sm:text-base">
              {error}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Wheel Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Wheel Display */}
            <Card className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-lg border-2 border-yellow-400/30 text-white shadow-2xl">
              <CardHeader className="text-center px-3 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  🎯 MEGA SPIN WHEEL 🎯
                </CardTitle>
                <CardDescription className="text-yellow-200 text-base sm:text-lg font-semibold">
                  {spinsRemaining} spins remaining
                </CardDescription>
                {nextReset && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-400">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Next reset in {nextReset.hoursUntilReset}h (Period {nextReset.nextPeriod}/3)
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-center px-3 sm:px-6 pb-4 sm:pb-6">
                {/* Wheel Container */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto mb-4 sm:mb-6">
                  {/* Pointer at top */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-30">
                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500"></div>
                  </div>
                  
                  {/* Spinning wheel */}
                  <div 
                    className="w-full h-full rounded-full shadow-lg"
                    style={{ 
                      transform: `rotate(${rotation + 0}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
                    }}
                  >
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {wheelSegments.map((segment, index) => {
                        const segmentAngle = 360 / wheelSegments.length;
                        const startAngle = index * segmentAngle - 90; // Start from top
                        const endAngle = startAngle + segmentAngle;
                        
                        // Convert to radians
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        
                        // Calculate path for segment
                        const x1 = 100 + 95 * Math.cos(startRad);
                        const y1 = 100 + 95 * Math.sin(startRad);
                        const x2 = 100 + 95 * Math.cos(endRad);
                        const y2 = 100 + 95 * Math.sin(endRad);
                        
                        const largeArc = segmentAngle > 180 ? 1 : 0;
                        
                        // Calculate text position (middle of segment)
                        const midAngle = startAngle + segmentAngle / 2;
                        const midRad = (midAngle * Math.PI) / 180;
                        const textX = 100 + 60 * Math.cos(midRad);
                        const textY = 100 + 60 * Math.sin(midRad);
                        const iconY = textY - 12;
                        
                        return (
                          <g key={segment.id}>
                            {/* Segment background - solid color */}
                            <path
                              d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={segment.color}
                              stroke="white"
                              strokeWidth="2"
                            />
                            
                            {/* Points text */}
                            {segment.label && (
                              <text
                                x={textX}
                                y={textY + 3}
                                fill="white"
                                fontSize="20"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                {segment.label}
                              </text>
                            )}
                            
                            {/* Icon */}
                            {segment.icon && (
                              <text
                                x={textX}
                                y={iconY}
                                fill="white"
                                fontSize="18"
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                {segment.icon}
                              </text>
                            )}
                          </g>
                        );
                      })}
                      
                      {/* Center circle */}
                      <circle cx="100" cy="100" r="25" fill="white" stroke="#333" strokeWidth="2" />
                      
                      {/* Center text - vertical */}
                      <text
                        x="100"
                        y="90"
                        fill="#333"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        S
                      </text>
                      <text
                        x="100"
                        y="100"
                        fill="#333"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        P
                      </text>
                      <text
                        x="100"
                        y="110"
                        fill="#333"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        I
                      </text>
                      <text
                        x="100"
                        y="120"
                        fill="#333"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        N
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Spin Button */}
                <Button 
                  onClick={spinWheel}
                  disabled={spinsRemaining <= 0 || isSpinning}
                  className={`w-32 h-14 sm:w-36 sm:h-15 md:w-40 md:h-16 text-base sm:text-lg md:text-xl font-black rounded-full shadow-2xl transition-all duration-300 relative overflow-hidden group ${
                    spinsRemaining > 0 && !isSpinning
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-white hover:scale-110 hover:shadow-yellow-500/50 active:scale-95'
                      : 'bg-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSpinning ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="text-sm sm:text-base">Spinning...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-sm sm:text-base">🎯</span>
                      <span className="text-sm sm:text-base">SPIN!</span>
                      <span className="text-sm sm:text-base">🎯</span>
                    </div>
                  )}
                </Button>

                {/* Spins Info */}
                <div className="mt-4 sm:mt-6 space-y-2">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-2 sm:p-3 border border-green-400/30">
                    <p className="text-green-300 font-semibold text-xs sm:text-sm md:text-base">🎯 Daily free spin</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-2 sm:p-3 border border-orange-400/30">
                    <p className="text-orange-300 font-semibold text-xs sm:text-sm md:text-base">🔥 3-day streak = 2 bonus spins</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-2 sm:p-3 border border-purple-400/30">
                    <p className="text-purple-300 font-semibold text-xs sm:text-sm md:text-base">💎 Buy extra spins below</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Result Display */}
            {showResult && result && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-sm border-yellow-400/50 text-white shadow-2xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      🎉 Congratulations! 🎉
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <motion.div 
                      className="text-8xl mb-6"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {result.icon}
                    </motion.div>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 mb-4">
                      <p className="text-3xl font-black mb-2 text-yellow-300">
                        You won {result.points} points!
                      </p>
                      <p className="text-lg text-yellow-200">
                        {result.points} points and {(result.points * 0.001).toFixed(2)} PineCoins added to your account!
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="bg-green-500/20 px-3 py-1 rounded-full">
                        <span className="text-green-300">+{result.points} Points</span>
                      </div>
                      <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                        <span className="text-blue-300">+{(result.points * 0.001).toFixed(2)} PineCoins</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Purchase Section */}
          <div className="space-y-6">
            {/* Buy Spins */}
            <Card className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 backdrop-blur-lg border-2 border-yellow-400/30 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-black">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  💰 BUY EXTRA SPINS 💰
                </CardTitle>
                <CardDescription className="text-yellow-200 text-lg">
                  Get more chances to win with PineCoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spinPrices.map((offer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 transition-all duration-300 cursor-pointer">
                      <div>
                        <p className="font-black text-lg text-slate-900">{offer.spins} Spins</p>
                        <p className="text-sm text-purple-300 font-semibold">
                          {offer.discount} discount
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-yellow-300">{offer.price} PineCoins</p>
                        <Button 
                          onClick={() => buySpins(offer.spins, offer.price)}
                          size="sm"
                          className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-full px-6 py-2 shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                          💎 Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wheel Prizes */}
            <Card className="bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 backdrop-blur-lg border-2 border-emerald-400/30 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-black">
                  <Gift className="w-6 h-6 text-emerald-400" />
                  🎁 WHEEL PRIZES 🎁
                </CardTitle>
                <CardDescription className="text-emerald-200 text-lg">
                  All possible rewards you can win
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {wheelSegments.map((segment) => (
                    <div key={segment.id} className={`text-center p-4 rounded-xl bg-gradient-to-br ${segment.gradient} shadow-lg transition-all duration-300 cursor-pointer`}>
                      <div className="text-3xl mb-2 drop-shadow-lg">{segment.icon}</div>
                      <p className="text-lg font-black text-slate-900">{segment.label}</p>
                      <p className="text-xs text-slate-700 font-semibold">{segment.points} PTS</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-lg border-2 border-blue-400/30 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-black">
                  <Target className="w-6 h-6 text-blue-400" />
                  💡 PRO TIPS 💡
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-400/30">
                    <p className="text-yellow-300 font-semibold">🎯 Come back daily for free spins</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg p-3 border border-red-400/30">
                    <p className="text-red-300 font-semibold">🔥 Maintain 3-day login streak for bonus spins</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-3 border border-purple-400/30">
                    <p className="text-purple-300 font-semibold">⭐ Bigger rewards have equal chances</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-400/30">
                    <p className="text-green-300 font-semibold">💰 Points convert to PineCoins (1000 points = 1 PineCoin)</p>
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-3 border border-cyan-400/30">
                    <p className="text-cyan-300 font-semibold">🚀 Use PineCoins to buy extra spins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
