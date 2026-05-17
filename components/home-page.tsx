"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Share2, Gift, Target, Calendar, Coins, Users, ArrowRight, MessageCircle, Eye, UserPlus, Newspaper, Star, CheckCircle, ShieldCheck, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { StructuredData, organizationSchema, websiteSchema, webApplicationSchema } from "@/components/structured-data";
import { resolveNewsImageUrl } from "@/lib/news-image";
import { PineHeroSection } from "@/components/PineHeroSection";
import { CinematicFooter, CinematicStyles } from "@/components/ui/motion-footer";

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
  category?: string;
}

interface TaskPointRules {
  signup_points: number;
  referral_points: number;
  share_social_points: number;
  share_news_points: number;
  comment_points: number;
  like_points: number;
  daily_login_points: number;
  login_streak_bonus_days: number;
  login_streak_bonus_spins: number;
}

const defaultTaskPointRules: TaskPointRules = {
  signup_points: 50,
  referral_points: 30,
  share_social_points: 20,
  share_news_points: 10,
  comment_points: 5,
  like_points: 5,
  daily_login_points: 5,
  login_streak_bonus_days: 3,
  login_streak_bonus_spins: 2
};

export default function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://pinecrest.konhito.me";
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [taskPointRules, setTaskPointRules] = useState<TaskPointRules>(defaultTaskPointRules);
  const itemsPerPage = 6;

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
      (async () => {
        try {
          const response = await fetch(`${apiBase}/api/users/leaderboard/public?limit=1`);
          if (!response.ok) return;
          const result = await response.json();
          const rules = result?.data?.task_point_rules;
          if (rules) {
            setTaskPointRules({
              ...defaultTaskPointRules,
              ...rules
            });
          }
        } catch (error) {
          console.error("Error fetching task point rules:", error);
        }
      })();
    }, 100);

    return () => clearTimeout(timer);
  }, [apiBase]);

  const fetchNews = async (page: number) => {
    try {
      setLoadingNews(true);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/news?${params}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.articles) {
          setNewsItems(result.data.articles);
        }
      }
    } catch (error) {
      console.error('Error fetching news articles:', error);
    } finally {
      setLoadingNews(false);
    }
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

      <CinematicStyles />
      <div className="relative overflow-hidden">
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
          <PineHeroSection
            signupPoints={taskPointRules.signup_points}
            referralPoints={taskPointRules.referral_points}
          />
        </div>

        <div className="cinematic-footer-wrapper relative bg-background text-foreground">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />
          <div className="relative z-10">
            {/* Leaderboard Section */}
            <section id="leaderboard" className="py-10 sm:py-14 md:py-18 px-4 relative z-10 bg-background/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-emerald-600 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-3">
                Weekly Leaderboard
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-3 leading-relaxed">
                Compete with other users and climb the ranks to win amazing rewards
              </p>
              <Link href="/dashboard/leaderboard" className="inline-block px-3">
                <Button className="footer-glass-pill inline-flex items-center gap-2 rounded-full px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 text-sm sm:text-base md:text-lg font-semibold text-foreground shadow-lg transition-all duration-200 hover:shadow-xl active:shadow-md hover:scale-105 active:scale-100 touch-target no-select">
                  View Full Leaderboard <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-background/70 border-border/50 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/80 mb-1">Signup Bonus</p>
                  <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <AnimatedCounter value={taskPointRules.signup_points} suffix=" pts" />
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background/70 border-border/50 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/80 mb-1">Referral Reward</p>
                  <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <AnimatedCounter value={taskPointRules.referral_points} suffix=" pts" />
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background/70 border-border/50 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/80 mb-1">Daily Login</p>
                  <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-emerald-700" />
                    <AnimatedCounter value={taskPointRules.daily_login_points} suffix=" pts" />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 sm:py-14 md:py-18 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Subtle background enhancement */}
            <div className="absolute inset-0 bg-background/40 border border-border/40 rounded-2xl sm:rounded-3xl -m-2 sm:-m-4 pointer-events-none"></div>
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-3">
                How You Earn PineCoins
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-3 leading-relaxed">
                Multiple ways to earn rewards from your social media activities
              </p>
              <div className="mt-4 sm:mt-5 flex flex-wrap justify-center gap-2 sm:gap-3 px-3">
                <span className="footer-glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  AI-verified task proof
                </span>
                <span className="footer-glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  Real rewards every week
                </span>
              </div>
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
                  description: `Share posts on social media and earn ${taskPointRules.share_social_points} points per share`,
                  points: `${taskPointRules.share_social_points} pts`,
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
                  description: `Invite friends and earn ${taskPointRules.referral_points} points per successful referral`,
                  points: `${taskPointRules.referral_points} pts`,
                  color: "from-emerald-600 to-emerald-700"
                },
                {
                  icon: Calendar,
                  title: "Daily Login",
                  description: `Log in daily to claim ${taskPointRules.daily_login_points} points and maintain your streak`,
                  points: `${taskPointRules.daily_login_points} pts`,
                  color: "from-blue-600 to-blue-700"
                },
                {
                  icon: MessageCircle,
                  title: "Engage & Comment",
                  description: `Comment and like posts to earn ${taskPointRules.comment_points} and ${taskPointRules.like_points} points`,
                  points: `${taskPointRules.comment_points}/${taskPointRules.like_points} pts`,
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
                  <Card className="h-full bg-background/70 backdrop-blur-md border-border/40 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 cursor-pointer no-select">
                    <CardHeader className="text-center pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md`}>
                        <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg text-foreground leading-snug">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">{feature.description}</p>
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
        <section id="news" className="py-10 sm:py-14 md:py-18 px-4 relative z-10 bg-background/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 bg-background/40 border border-border/40 rounded-2xl sm:rounded-3xl -m-2 sm:-m-4 pointer-events-none"></div>
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-3">
                Latest News & Updates
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-3 leading-relaxed">
                Stay updated with the latest features, challenges, and community news
              </p>
              <Link href="/news" className="inline-flex mt-4 text-sm sm:text-base text-muted-foreground hover:text-foreground font-semibold">
                Browse all updates <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </motion.div>

            {loadingNews ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
                {[...Array(itemsPerPage)].map((_, index) => (
                  <Card key={index} className="h-full bg-background/70 backdrop-blur-md border-border/40 shadow-lg animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted/60 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-muted/60 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted/60 rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted/60 rounded w-2/3"></div>
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
                      <Link href={`/news/${encodeURIComponent(news.slug)}`} className="block h-full">
                        <Card className="h-full bg-background/70 backdrop-blur-md border-border/40 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 no-select cursor-pointer">
                          <div className="relative h-44 w-full overflow-hidden bg-muted/40">
                            {news.featured_image ? (
                              <img
                                src={resolveNewsImageUrl(news.featured_image, apiBase) || undefined}
                                alt={news.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground/80">
                                <div className="text-center">
                                  <Newspaper className="w-8 h-8 mx-auto mb-2 text-emerald-700" />
                                  <p className="text-sm font-medium">PineCrest Update</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              {news.tags && news.tags.length > 0 && (
                                <Badge className="footer-glass-pill text-muted-foreground">
                                  {news.tags[0]}
                                </Badge>
                              )}
                              <span className="text-sm text-muted-foreground/80">
                                {formatDate(news.published_at)}
                              </span>
                            </div>
                            <CardTitle className="text-lg text-foreground line-clamp-2">
                              {news.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4 line-clamp-3">{news.excerpt}</p>
                            <div className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors">
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
                  <Link href="/news" className="relative z-10">
                    <Button className="footer-glass-pill rounded-full px-8 py-4 text-lg font-semibold text-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 relative z-10 pointer-events-auto">
                      View All News & Updates
                    </Button>
                  </Link>
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
                <p className="text-muted-foreground text-lg mb-4">No news available at the moment.</p>
                <Link href="/news" className="relative z-10">
                  <Button className="footer-glass-pill rounded-full px-8 py-4 text-lg font-semibold text-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 relative z-10 pointer-events-auto">
                    View All News & Updates
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-10 sm:py-14 md:py-18 px-4 relative z-10 bg-background/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-6 sm:mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Users className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-emerald-600 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-3">
                About PineCrest
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 px-3 leading-relaxed">
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
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  PineCrest empowers users to earn real value from their social media activities.
                  We connect users with engaging tasks from brands and creators, making it easy to
                  convert your online engagement into PineCoins and real rewards.
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Why Choose Us</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="footer-glass-pill w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>AI-verified tasks ensure authenticity and prevent fraud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="footer-glass-pill w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Fair weekly leaderboards with automatic resets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="footer-glass-pill w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Secure platform with industry-standard protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="footer-glass-pill w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Real rewards you can redeem for cash and prizes</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <Card className="bg-background/70 border border-border/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Verified Tasks</h4>
                        <p className="text-sm text-muted-foreground">All tasks are AI-verified</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/70 border border-border/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Real Rewards</h4>
                        <p className="text-sm text-muted-foreground">Redeem PineCoins for prizes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/70 border border-border/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Fair Competition</h4>
                        <p className="text-sm text-muted-foreground">Weekly leaderboard resets</p>
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
                <Button className="footer-glass-pill rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-foreground w-full sm:w-auto shadow-lg transition-all duration-200 hover:shadow-xl">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-3">
                What Our Users Say
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-3 leading-relaxed">
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
                  <Card className="h-full bg-background/70 backdrop-blur-md border-border/40 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 no-select">
                    <CardHeader className="text-center pb-4">
                      <div className="text-4xl mb-4">{testimonial.avatar}</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <CardTitle className="text-lg text-foreground">{testimonial.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{testimonial.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground italic">"{testimonial.content}"</p>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-3">
                Ready to Start Earning?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-6 md:mb-8 max-w-xl mx-auto px-3 leading-relaxed">
                Join PineCrest today and start earning rewards from your social media activities.
                It's free to join and you can start earning immediately!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-3">
                <Link href="/sign-up" className="inline-block w-full sm:w-auto sm:min-w-[220px]">
                  <Button className="footer-glass-pill w-full rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base md:text-lg font-semibold text-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-100 touch-target no-select">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/news" className="inline-block w-full sm:w-auto sm:min-w-[220px]">
                  <Button className="footer-glass-pill w-full rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base md:text-lg font-semibold text-muted-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:text-foreground touch-target no-select">
                    Explore News
                  </Button>
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 px-3">
                <span className="footer-glass-pill rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                  No sign-up fee
                </span>
                <span className="footer-glass-pill rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                  Weekly leaderboard payouts
                </span>
              </div>
            </motion.div>
          </div>
        </section>
          </div>
        </div>
      </div>
      <CinematicFooter />
    </>
  );
}

