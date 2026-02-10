"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Share2, Gift, Target, TrendingUp, Calendar, BarChart3, Sparkles, Coins, Users, ArrowRight, MessageCircle, ThumbsUp, Eye, UserPlus, Newspaper, Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { StructuredData, organizationSchema, websiteSchema, webApplicationSchema } from "@/components/structured-data";

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

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  tags: string[];
  featured_image?: string;
}

export default function HomePage() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 5;

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

  // Fetch news articles after page loads
  useEffect(() => {
    // Wait a bit to ensure all other data is loaded first
    const timer = setTimeout(() => {
      fetchNews(1);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchNews = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingNews(true);
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/news?${params}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.articles) {
          const articles = result.data.articles;
          const pagination = result.data.pagination;

          if (append) {
            setNewsItems(prev => {
              const newItems = [...prev, ...articles];
              // Check if there are more news items
              if (pagination && pagination.total) {
                setHasMoreNews(newItems.length < pagination.total);
              } else {
                // If no pagination info, assume no more if we got fewer items than requested
                setHasMoreNews(articles.length === itemsPerPage);
              }
              return newItems;
            });
          } else {
            setNewsItems(articles);
            // Check if there are more news items
            if (pagination && pagination.total) {
              setHasMoreNews(articles.length < pagination.total);
            } else {
              // If no pagination info, assume no more if we got fewer items than requested
              setHasMoreNews(articles.length === itemsPerPage);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching news articles:', error);
    } finally {
      setLoadingNews(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchNews(nextPage, true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      name: "Yakubu Ajayi",
      role: "Social Media Influencer",
      content: "PineCrest has transformed how I engage with social media. I'm earning rewards for activities I already love doing!",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      id: 2,
      name: "Nkem Okoye",
      role: "Content Creator",
      content: "The referral system is amazing. I've earned over 500 points just by sharing with friends!",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      id: 3,
      name: "Ibrahim Bakak",
      role: "Student",
      content: "Perfect for students! I earn PineCoins while studying and sharing educational content.",
      avatar: "👩‍🎓",
      rating: 5
    }
  ];

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={webApplicationSchema} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 overflow-hidden relative">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main floating orbs */}
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

          {/* Additional floating elements */}
          <motion.div
            className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-300 to-green-300 rounded-full blur-2xl opacity-50"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full blur-2xl opacity-50"
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          {/* Geometric shapes */}
          <motion.div
            className="absolute top-1/3 right-1/3 w-16 h-16 border-2 border-emerald-200/30 rotate-45"
            animate={{
              rotate: [45, 405, 45],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-12 h-12 border-2 border-blue-200/30 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/4 left-1/2 w-8 h-8 bg-gradient-to-br from-emerald-300/20 to-blue-300/20 rounded-full"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400/40 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}

          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-100/20"></div>
        </div>

        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 text-center safe-top">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Background card for better text readability */}
            <div className="absolute inset-0 bg-white/10 rounded-2xl sm:rounded-3xl -m-2 sm:-m-4 md:-m-8 pointer-events-none"></div>
            {/* Main Title with Animation */}
            <motion.div
              className="mb-6 sm:mb-8 md:mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-600 bg-clip-text text-transparent px-2 leading-tight"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                PineCrest
              </motion.h1>
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 hidden sm:block" />
                <span className="text-sm sm:text-base md:text-lg text-slate-600 font-medium text-center leading-relaxed">Earn Rewards from Social Media Activities</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 hidden sm:block" />
              </motion.div>
            </motion.div>

            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 text-slate-600 max-w-3xl mx-auto leading-relaxed px-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Transform your social media engagement into real rewards. Share content, watch videos,
              refer friends, and earn PineCoins that you can convert to real money.
              Join thousands of users already earning!
            </motion.p>

            {/* Exchange Rate Display */}
            <motion.div
              className="mb-6 sm:mb-8 md:mb-10 px-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200/50 w-full max-w-md sm:max-w-2xl mx-auto">
                <div className="text-center flex-1 py-1 sm:py-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">₽1 = $0.95</div>
                  <div className="text-xs text-slate-500 mt-0.5">Buy Rate</div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-slate-300 self-center"></div>
                <div className="block sm:hidden w-full h-px bg-slate-200"></div>
                <div className="text-center flex-1 py-1 sm:py-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">₽1 = $1.05</div>
                  <div className="text-xs text-slate-500 mt-0.5">Sell Rate</div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch sm:items-center px-3 max-w-sm sm:max-w-full mx-auto relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/sign-up" className="w-full sm:w-auto relative z-10">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-105 active:scale-100 transition-all duration-200 text-sm sm:text-base touch-target no-select relative z-10 pointer-events-auto">
                  Start Earning Now
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto relative z-10">
                <Button variant="outline" className="w-full sm:w-auto border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 active:border-emerald-600 active:text-emerald-700 hover:bg-emerald-50/50 active:bg-emerald-100/50 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-md hover:shadow-lg active:shadow-sm transform hover:scale-105 active:scale-100 transition-all duration-200 text-sm sm:text-base touch-target no-select relative z-10 pointer-events-auto">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="py-10 sm:py-14 md:py-18 px-4 relative z-10 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-emerald-600 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 px-3">
                Weekly Leaderboard
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-3 leading-relaxed">
                Compete with other users and climb the ranks to win amazing rewards
              </p>
              <Link href="/dashboard/leaderboard" className="inline-block px-3">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-semibold px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-105 active:scale-100 transition-all duration-200 text-sm sm:text-base md:text-lg touch-target no-select inline-flex items-center gap-2">
                  View Full Leaderboard <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 sm:py-14 md:py-18 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Subtle background enhancement */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-blue-50/30 rounded-2xl sm:rounded-3xl -m-2 sm:-m-4 pointer-events-none"></div>
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 px-3">
                How You Earn PineCoins
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-3 leading-relaxed">
                Multiple ways to earn rewards from your social media activities
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
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
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Card className="h-full bg-white/90 backdrop-blur-md border-slate-200/50 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 cursor-pointer no-select">
                    <CardHeader className="text-center pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md`}>
                        <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg text-slate-800 leading-snug">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">{feature.description}</p>
                      <Badge className={`bg-gradient-to-r ${feature.color} text-white px-3 py-1.5 text-xs font-semibold shadow-sm`}>
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
        <section className="py-10 sm:py-14 md:py-18 px-4 relative z-10 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/60 to-emerald-50/80 rounded-2xl sm:rounded-3xl -m-2 sm:-m-4 pointer-events-none"></div>
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 px-3">
                Latest News & Updates
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-3 leading-relaxed">
                Stay updated with the latest features, challenges, and community news
              </p>
            </motion.div>

            {loadingNews ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
                {[...Array(5)].map((_, index) => (
                  <Card key={index} className="h-full bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : newsItems.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {newsItems.map((news, index) => (
                    <motion.div
                      key={news.id}
                      variants={itemVariants}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Link href={`/news/${news.slug}`} className="block h-full">
                        <Card className="h-full bg-white/90 backdrop-blur-md border-slate-200/50 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 no-select cursor-pointer">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              {news.tags && news.tags.length > 0 && (
                                <Badge className="bg-emerald-100 text-emerald-700">
                                  {news.tags[0]}
                                </Badge>
                              )}
                              <span className="text-sm text-slate-500">
                                {formatDate(news.published_at)}
                              </span>
                            </div>
                            <CardTitle className="text-lg text-slate-800 line-clamp-2">
                              {news.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600 mb-4 line-clamp-3">{news.excerpt}</p>
                            <div className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                              Read More <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="text-center relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {hasMoreNews ? (
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed relative z-10 pointer-events-auto"
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  ) : (
                    <div className="space-y-4 relative z-10">
                      <p className="text-slate-600 text-lg">You've seen all the latest news!</p>
                      <Link href="/news" className="relative z-10">
                        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg relative z-10 pointer-events-auto">
                          View All News & Updates
                        </Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              </>
            ) : (
              <motion.div
                className="text-center py-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-slate-600 text-lg mb-4">No news available at the moment.</p>
                <Link href="/news" className="relative z-10">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg relative z-10 pointer-events-auto">
                    View All News & Updates
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-10 sm:py-14 md:py-18 px-4 relative z-10 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Users className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-emerald-600 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 px-3">
                About PineCrest
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-3 leading-relaxed">
                Transforming social media engagement into real rewards
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-10 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="px-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">Our Mission</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  PineCrest empowers users to earn real value from their social media activities.
                  We connect users with engaging tasks from brands and creators, making it easy to
                  convert your online engagement into PineCoins and real rewards.
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Why Choose Us</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>AI-verified tasks ensure authenticity and prevent fraud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Fair weekly leaderboards with automatic resets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Secure platform with industry-standard protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Real rewards you can redeem for cash and prizes</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Verified Tasks</h4>
                        <p className="text-sm text-slate-600">All tasks are AI-verified</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Real Rewards</h4>
                        <p className="text-sm text-slate-600">Redeem PineCoins for prizes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Fair Competition</h4>
                        <p className="text-sm text-slate-600">Weekly leaderboard resets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              className="text-center mt-8 sm:mt-10 md:mt-12 px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/about">
                <Button variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 text-base sm:text-lg w-full sm:w-auto">
                  Learn More About Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-10 sm:py-14 md:py-18 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 px-3">
                What Our Users Say
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-3 leading-relaxed">
                Join thousands of satisfied users earning rewards from social media
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  variants={itemVariants}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Card className="h-full bg-white/90 backdrop-blur-md border-slate-200/50 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 no-select">
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
        <section className="py-10 sm:py-14 md:py-18 px-4 relative z-10 safe-bottom mb-10 sm:mb-14 md:mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 px-3">
                Ready to Start Earning?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-5 sm:mb-6 md:mb-8 max-w-xl mx-auto px-3 leading-relaxed">
                Join PineCrest today and start earning rewards from your social media activities.
                It's free to join and you can start earning immediately!
              </p>
              <Link href="/sign-up" className="inline-block w-full max-w-xs sm:max-w-sm px-3">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-105 active:scale-100 transition-all duration-200 text-sm sm:text-base md:text-lg touch-target no-select">
                  Get Started Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
