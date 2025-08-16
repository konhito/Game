"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, Users, TrendingUp, Gamepad2, Gift, ArrowRight, Star, Zap, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Animated Counter Component
function AnimatedCounter({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  return (
    <motion.span 
      className={`font-bold ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {value.toLocaleString()}{suffix}
    </motion.span>
  );
}

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-60"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full blur-3xl opacity-60"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-3xl opacity-40"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 border-b border-slate-200/50 backdrop-blur-md bg-white/70 sticky top-0"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                PineCoin Casino
              </span>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {["Features", "Leaderboard", "About", "Sign In"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    href={item === "Sign In" ? "/sign-in" : `#${item.toLowerCase()}`}
                    className="text-slate-600 hover:text-violet-600 transition-colors font-medium relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Main Title with Animation */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-slate-800 via-violet-700 to-purple-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              PineCoin Casino
            </motion.h1>
            <motion.div 
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-violet-500" />
              <span className="text-xl text-slate-600 font-medium">The Ultimate Gaming Experience</span>
              <Sparkles className="w-6 h-6 text-violet-500" />
            </motion.div>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Compete, Win, and Earn! Join the ultimate gaming platform where your skills and luck 
            can earn you real rewards. Climb the leaderboard and claim your prizes!
          </motion.p>
          
          {/* Exchange Rate Ticker with Animation */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 mb-12 max-w-4xl mx-auto border border-slate-200/50 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Coins className="w-6 h-6 text-amber-600" />
                <div>
                  <div className="font-semibold text-amber-800">Buy: ₦1,450</div>
                  <div className="text-sm text-amber-600">Best Rate</div>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Coins className="w-6 h-6 text-emerald-600" />
                <div>
                  <div className="font-semibold text-emerald-800">Sell: ₦1,350</div>
                  <div className="text-sm text-emerald-600">Instant</div>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div>
                  <div className="font-bold text-violet-800 text-lg">1 PineCoin = $1 USDT</div>
                  <div className="text-sm text-violet-600">Fixed Rate</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/sign-up">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold px-10 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200">
                  Start Playing Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-violet-400 px-10 py-4 text-lg rounded-2xl backdrop-blur-sm font-semibold">
                  View Leaderboard
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { value: 10000, suffix: "+", label: "Active Players", color: "from-amber-400 to-orange-500" },
              { value: 500000, suffix: "+", label: "PineCoins Won", color: "from-emerald-400 to-green-500" },
              { value: 1000000, suffix: "+", label: "Total Points", color: "from-blue-400 to-indigo-500" },
              { value: 50000, suffix: "₦", label: "Weekly Prizes", color: "from-violet-400 to-purple-500" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Why Choose <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">PineCoin Casino</span>?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the most engaging and rewarding gaming platform ever created
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Leaderboard Feature */}
            <motion.div variants={itemVariants}>
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-800 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">Weekly Leaderboard</CardTitle>
                  <CardDescription className="text-slate-600">
                    Compete for weekly rewards! Top 3 players get 50%, 30%, and 15% of the prize pool.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { icon: "🥇", place: "1st Place", reward: "50%", color: "bg-amber-500" },
                      { icon: "🥈", place: "2nd Place", reward: "30%", color: "bg-slate-400" },
                      { icon: "🥉", place: "3rd Place", reward: "15%", color: "bg-orange-500" },
                      { icon: "🎲", place: "Random", reward: "5%", color: "bg-violet-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-medium">{item.place}:</span>
                        </span>
                        <Badge className={`${item.color} text-white font-bold px-3 py-1 rounded-full`}>
                          {item.reward}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prize Pool Feature */}
            <motion.div variants={itemVariants}>
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-800 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Gift className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">Prize Pools</CardTitle>
                  <CardDescription className="text-slate-600">
                    Join exciting prize pools where one lucky winner takes home the entire pot!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-emerald-600 mb-3">80%</div>
                    <p className="text-slate-600 mb-6 font-medium">You keep the majority!</p>
                    <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                      <motion.div 
                        className="bg-gradient-to-r from-emerald-400 to-green-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "80%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <p className="text-sm text-slate-500">Platform keeps only 20%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Spinning Wheel Feature */}
            <motion.div variants={itemVariants}>
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-800 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">Spinning Wheel</CardTitle>
                  <CardDescription className="text-slate-600">
                    Daily free spins with amazing rewards! Mystery boxes, points, and more!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { icon: "🎯", text: "Daily Free Spin", bg: "from-blue-100 to-indigo-100" },
                      { icon: "🔥", text: "3-Day Streak = 2 Extra Spins", bg: "from-orange-100 to-red-100" },
                      { icon: "💎", text: "Buy Extra Spins with PineCoins", bg: "from-violet-100 to-purple-100" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className={`flex items-center justify-center gap-3 p-3 rounded-2xl bg-gradient-to-r ${item.bg} border border-slate-200`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Points System */}
            <motion.div variants={itemVariants}>
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-800 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TrendingUp className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">Points System</CardTitle>
                  <CardDescription className="text-slate-600">
                    Earn points through various activities and climb the leaderboard!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: "🎁", action: "Signup", points: "20 pts", color: "bg-emerald-500" },
                      { icon: "👥", action: "Referral", points: "10 pts", color: "bg-blue-500" },
                      { icon: "📺", action: "Watch Ads", points: "5 pts", color: "bg-violet-500" },
                      { icon: "📱", action: "Share Posts", points: "20 pts", color: "bg-orange-500" },
                      { icon: "🌅", action: "Daily Login", points: "5 pts", color: "bg-pink-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.action}:</span>
                        </span>
                        <Badge className={`${item.color} text-white font-bold px-3 py-1 rounded-full`}>
                          {item.points}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community */}
            <motion.div variants={itemVariants}>
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-800 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">Community</CardTitle>
                  <CardDescription className="text-slate-600">
                    Connect with other players, share achievements, and compete together!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-pink-600 mb-3">24/7</div>
                    <p className="text-slate-600 mb-6 font-medium">Active Community</p>
                    <div className="flex justify-center space-x-2">
                      {[0, 0.2, 0.4].map((delay, index) => (
                        <motion.div
                          key={index}
                          className="w-3 h-3 bg-pink-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Rewards */}
            <motion.div variants={itemVariants}>
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-800 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Coins className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">Real Rewards</CardTitle>
                  <CardDescription className="text-slate-600">
                    Convert your PineCoins to real money! 1 PineCoin = $1 USDT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-600 mb-3">$1 = ₦1,400</div>
                    <p className="text-slate-600 mb-6 font-medium">Current Exchange Rate</p>
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-3 rounded-2xl">
                      <p className="text-white font-bold text-sm">Instant Withdrawal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="bg-gradient-to-r from-violet-50 to-purple-50 backdrop-blur-sm rounded-3xl p-16 border border-violet-200/50 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 300 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Ready to Start <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Winning</span>?
            </h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Join thousands of players already competing and earning on PineCoin Casino!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/sign-up">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold px-10 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200">
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-violet-400 px-10 py-4 text-lg rounded-2xl backdrop-blur-sm font-semibold">
                    Explore Dashboard
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
