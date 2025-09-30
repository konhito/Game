"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Target } from "lucide-react";

const wheelSegments = [
  { id: 1, label: "2", points: 2, color: "bg-blue-500", icon: "🎯" },
  { id: 2, label: "4", points: 4, color: "bg-green-500", icon: "🍀" },
  { id: 3, label: "50", points: 50, color: "bg-yellow-500", icon: "⭐" },
  { id: 4, label: "3", points: 3, color: "bg-red-500", icon: "🔥" },
  { id: 5, label: "10", points: 10, color: "bg-purple-500", icon: "💎" },
  { id: 6, label: "1", points: 1, color: "bg-pink-500", icon: "🎁" },
  { id: 7, label: "20", points: 20, color: "bg-indigo-500", icon: "🚀" },
  { id: 8, label: "5", points: 5, color: "bg-orange-500", icon: "⚡" },
  { id: 9, label: "Mystery", points: "?", color: "bg-gray-600", icon: "❓" },
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

  const spinWheel = () => {
    if (spinsRemaining <= 0 || isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    // Random rotation between 5-10 full rotations plus random segment
    const baseRotation = 1800 + Math.random() * 1800; // 5-10 full rotations
    const segmentAngle = 360 / wheelSegments.length;
    const randomSegment = Math.floor(Math.random() * wheelSegments.length);
    const finalRotation = baseRotation + (randomSegment * segmentAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const selectedSegment = wheelSegments[randomSegment];
      setResult(selectedSegment);
      setShowResult(true);
      setSpinsRemaining(prev => prev - 1);
    }, 3000);
  };

  const buySpins = (spins: number, price: number) => {
    // TODO: Implement PineCoin purchase logic
    console.log(`Buying ${spins} spins for ${price} PineCoins`);
    setSpinsRemaining(prev => prev + spins);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Spinning Wheel</h1>
          <p className="text-gray-300">Spin to win points and amazing rewards!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Wheel Section */}
          <div className="space-y-6">
            {/* Wheel Display */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle>Fortune Wheel</CardTitle>
                <CardDescription className="text-gray-300">
                  {spinsRemaining} spins remaining
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {/* Wheel */}
                <div className="relative w-80 h-80 mx-auto mb-6">
                  <div 
                    className={`w-full h-full rounded-full border-4 border-white/30 transition-transform duration-3000 ease-out ${
                      isSpinning ? 'animate-spin' : ''
                    }`}
                    style={{ 
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                    }}
                  >
                    {wheelSegments.map((segment, index) => {
                      const angle = (360 / wheelSegments.length) * index;
                      const segmentAngle = 360 / wheelSegments.length;
                      
                      return (
                        <div
                          key={segment.id}
                          className={`absolute w-0 h-0 border-l-[120px] border-r-[120px] border-b-[120px] border-l-transparent border-r-transparent ${segment.color}`}
                          style={{
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: '50% 50%',
                            left: '50%',
                            top: '50%',
                            marginLeft: '-120px',
                            marginTop: '-120px',
                          }}
                        >
                          <div 
                            className="absolute text-white font-bold text-lg"
                            style={{
                              transform: `rotate(${segmentAngle / 2}deg) translateY(-80px)`,
                              transformOrigin: '50% 50%',
                            }}
                          >
                            {segment.icon}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Center pointer */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                </div>

                {/* Spin Button */}
                <Button 
                  onClick={spinWheel}
                  disabled={spinsRemaining <= 0 || isSpinning}
                  className={`w-32 h-12 text-lg font-bold ${
                    spinsRemaining > 0 && !isSpinning
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                      : 'bg-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSpinning ? 'Spinning...' : 'SPIN!'}
                </Button>

                {/* Spins Info */}
                <div className="mt-4 text-sm text-gray-300">
                  <p>🎯 Daily free spin</p>
                  <p>🔥 3-day streak = 2 bonus spins</p>
                  <p>💎 Buy extra spins below</p>
                </div>
              </CardContent>
            </Card>

            {/* Result Display */}
            {showResult && result && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">🎉 Congratulations!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl mb-4">{result.icon}</div>
                  <p className="text-xl font-bold mb-2">
                    You won {result.points} points!
                  </p>
                  <p className="text-gray-300">
                    {result.label === "Mystery" 
                      ? "Mystery reward unlocked!" 
                      : `${result.points} points added to your account`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Purchase Section */}
          <div className="space-y-6">
            {/* Buy Spins */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Buy Extra Spins
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Get more chances to win with PineCoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spinPrices.map((offer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-medium">{offer.spins} Spins</p>
                        <p className="text-sm text-gray-400">
                          {offer.discount} discount
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{offer.price} PineCoins</p>
                        <Button 
                          onClick={() => buySpins(offer.spins, offer.price)}
                          size="sm"
                          className="mt-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wheel Prizes */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  Wheel Prizes
                </CardTitle>
                <CardDescription className="text-gray-300">
                  All possible rewards you can win
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {wheelSegments.map((segment) => (
                    <div key={segment.id} className="text-center p-2 rounded bg-white/5">
                      <div className="text-2xl mb-1">{segment.icon}</div>
                      <p className="text-sm font-medium">{segment.label}</p>
                      <p className="text-xs text-gray-400">
                        {segment.points === "?" ? "Mystery" : `${segment.points} pts`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>🎯 Come back daily for free spins</p>
                  <p>🔥 Maintain 3-day login streak for bonus spins</p>
                  <p>💎 Mystery boxes contain random rewards</p>
                  <p>⭐ Bigger rewards are rarer to get</p>
                  <p>🚀 Use PineCoins to buy extra spins</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
