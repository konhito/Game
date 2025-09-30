"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Share2, Gift, Target, TrendingUp, Calendar, BarChart3, Sparkles, Coins, Users, ArrowRight, MessageCircle, ThumbsUp, Eye, UserPlus, Newspaper, Star } from "lucide-react";
import Link from "next/link";

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

  // Sample news data
  const newsItems = [
    {
      id: 1,
      title: "New Social Media Challenge: Share Your Success Story",
      excerpt: "Share your PineCrest journey and earn up to 50 points!",
      date: "2 hours ago",
      category: "Challenge"
    },
    {
      id: 2,
      title: "Weekly Leaderboard Winners Announced",
      excerpt: "Congratulations to this week's top performers!",
      date: "1 day ago",
      category: "Leaderboard"
    },
    {
      id: 3,
      title: "New Video Content Available for Rewards",
      excerpt: "Watch our latest videos and earn points instantly.",
      date: "3 days ago",
      category: "Content"
    }
  ];

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Social Media Influencer",
      content: "PineCrest has transformed how I engage with social media. I'm earning rewards for activities I already love doing!",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Content Creator",
      content: "The referral system is amazing. I've earned over 500 points just by sharing with friends!",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Davis",
      role: "Student",
      content: "Perfect for students! I earn PineCoins while studying and sharing educational content.",
      avatar: "👩‍🎓",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full blur-3xl opacity-60"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-emerald-200 rounded-full blur-3xl opacity-60"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full blur-3xl opacity-40"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

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
            {/* Logo Display */}
            {/* <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
          
            </motion.div> */}
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              PineCrest
            </motion.h1>
            <motion.div 
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <span className="text-xl text-slate-600 font-medium">Earn Rewards from Social Media Activities</span>
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </motion.div>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Transform your social media engagement into real rewards. Share content, watch videos, 
            refer friends, and earn PineCoins that you can convert to real money. 
            Join thousands of users already earning from their online activities!
          </motion.p>

          {/* Exchange Rate Display */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="inline-flex items-center space-x-8 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">₽1 = $0.95</div>
                <div className="text-sm text-slate-500">Buy Rate</div>
              </div>
              <div className="w-px h-12 bg-slate-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₽1 = $1.05</div>
                <div className="text-sm text-slate-500">Sell Rate</div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
                Start Earning Now
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              How You Earn PineCoins
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Multiple ways to earn rewards from your social media activities
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Share2,
                title: "Share Content",
                description: "Share posts on social media and earn 20 points per share",
                points: "20 pts",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                icon: Eye,
                title: "Watch Videos",
                description: "Watch sponsored content and earn 5 points per video",
                points: "5 pts",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: UserPlus,
                title: "Refer Friends",
                description: "Invite friends and earn 10 points per successful referral",
                points: "10 pts",
                color: "from-emerald-600 to-emerald-700"
              },
              {
                icon: Calendar,
                title: "Daily Login",
                description: "Log in daily to claim 5 points and maintain your streak",
                points: "5 pts",
                color: "from-blue-600 to-blue-700"
              },
              {
                icon: MessageCircle,
                title: "Engage & Comment",
                description: "Comment and like posts to earn engagement points",
                points: "2 pts",
                color: "from-emerald-500 to-blue-500"
              },
              {
                icon: Gift,
                title: "Special Rewards",
                description: "Complete challenges and earn bonus points",
                points: "50+ pts",
                color: "from-blue-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-800">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-slate-600 mb-4">{feature.description}</p>
                    <Badge className={`bg-gradient-to-r ${feature.color} text-white px-4 py-2 text-sm font-semibold`}>
                      {feature.points}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-4 relative z-10 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Latest News & Updates
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Stay updated with the latest features, challenges, and community news
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {newsItems.map((news, index) => (
              <motion.div
                key={news.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                        {news.category}
                      </Badge>
                      <span className="text-sm text-slate-500">{news.date}</span>
                    </div>
                    <CardTitle className="text-lg text-slate-800 line-clamp-2">
                      {news.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{news.excerpt}</p>
                    <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 p-0 h-auto font-medium">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/news">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
                View All News & Updates
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of satisfied users earning rewards from social media
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="text-4xl mb-4">{testimonial.avatar}</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <CardTitle className="text-lg text-slate-800">{testimonial.name}</CardTitle>
                    <CardDescription className="text-slate-600">{testimonial.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-slate-600 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Join PineCrest today and start earning rewards from your social media activities. 
              It's free to join and you can start earning immediately!
            </p>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
