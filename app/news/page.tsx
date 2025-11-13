"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, User, ArrowLeft, ArrowRight, TrendingUp, Star, Zap, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author_name: string;
  published_at: string;
  views: number;
  featured: boolean;
  tags: string[];
}

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);

  // Fetch news articles from CMS
  useEffect(() => {
    fetchNewsArticles();
  }, [searchTerm, selectedCategory, currentPage]);

  const fetchNewsArticles = async () => {
    try {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'All') params.append('tag', selectedCategory);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://casinobackend-production-66bf.up.railway.app'}/api/news?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.articles && result.data.articles.length > 0) {
          setNewsItems(result.data.articles);
        } else {
          // Empty response - no articles found
          setNewsItems([]);
        }
      } else {
        // API error - will use fallback
        setError(true);
        setNewsItems([]);
      }
    } catch (error) {
      console.error('Error fetching news articles:', error);
      setError(true);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured article
  useEffect(() => {
    fetchFeaturedArticle();
  }, []);

  const fetchFeaturedArticle = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://casinobackend-production-66bf.up.railway.app'}/api/news?featured=true&limit=1`);
      if (response.ok) {
        const result = await response.json();
        if (result.data.articles.length > 0) {
          setFeaturedArticle(result.data.articles[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching featured article:', error);
    }
  };

  // Sample news data - fallback if API fails
  const fallbackNewsItems = [
    {
      id: 1,
      title: "New Social Media Challenge: Share Your Success Story",
      excerpt: "Share your PineCoin journey and earn up to 50 points! Complete the challenge by posting about your earnings and tagging friends.",
      content: "We're excited to announce our latest social media challenge! Share your PineCoin success story on any social media platform and earn up to 50 points. Simply post about how you've earned PineCoins, what you've learned, and tag 3 friends to participate. The best stories will be featured on our official channels and earn bonus rewards.",
      date: "2 hours ago",
      category: "Challenge",
      author: "PineCoin Team",
      readTime: "3 min read",
      featured: true,
      tags: ["challenge", "social media", "rewards"]
    },
    {
      id: 2,
      title: "Weekly Leaderboard Winners Announced",
      excerpt: "Congratulations to this week's top performers! See who made it to the top and claimed the biggest rewards.",
      content: "Another exciting week has come to an end, and we're thrilled to announce our weekly leaderboard winners! This week's competition was fierce, with users earning points through various activities including social sharing, video watching, and daily logins. The top 3 winners have been awarded their PineCoins, and we're already looking forward to next week's competition.",
      date: "1 day ago",
      category: "Leaderboard",
      author: "PineCoin Team",
      readTime: "2 min read",
      featured: false,
      tags: ["leaderboard", "winners", "rewards"]
    },
    {
      id: 3,
      title: "New Video Content Available for Rewards",
      excerpt: "Watch our latest videos and earn points instantly. New content added daily with engaging topics.",
      content: "We've just added a fresh batch of video content to our platform! From educational videos about social media strategies to entertaining content about earning rewards, there's something for everyone. Each video watched earns you 5 points, and we're adding new content daily to keep you engaged and earning.",
      date: "3 days ago",
      category: "Content",
      author: "Content Team",
      readTime: "1 min read",
      featured: false,
      tags: ["videos", "content", "points"]
    },
    {
      id: 4,
      title: "Platform Update: Enhanced Security Features",
      excerpt: "We've implemented new security measures to protect your account and ensure fair play for all users.",
      content: "Your security is our top priority. We've recently implemented enhanced security features including two-factor authentication, improved fraud detection, and better account protection. These updates ensure that all users can enjoy a safe and fair experience while earning PineCoins through legitimate activities.",
      date: "5 days ago",
      category: "Platform",
      author: "Security Team",
      readTime: "4 min read",
      featured: true,
      tags: ["security", "platform", "updates"]
    },
    {
      id: 5,
      title: "Referral Program Success Stories",
      excerpt: "Discover how our top referrers are earning hundreds of points by inviting friends to join PineCoin.",
      content: "Our referral program continues to be a huge success! We've collected inspiring stories from users who have earned hundreds of points by simply inviting their friends to join PineCoin. From students building passive income to professionals expanding their networks, the referral program is helping users achieve their financial goals.",
      date: "1 week ago",
      category: "Referrals",
      author: "Community Team",
      readTime: "3 min read",
      featured: false,
      tags: ["referrals", "success stories", "community"]
    },
    {
      id: 6,
      title: "Monthly Community Spotlight: Meet Our Top Users",
      excerpt: "Get to know the PineCoin community's most active and successful users this month.",
      content: "Every month, we shine a spotlight on our most active and successful users. This month, we're featuring users who have not only earned significant PineCoins but have also contributed to building our community through helpful posts, engagement, and support for new users. Their stories inspire us all to stay active and engaged.",
      date: "2 weeks ago",
      category: "Community",
      author: "Community Team",
      readTime: "5 min read",
      featured: true,
      tags: ["community", "spotlight", "users"]
    }
  ];

  const categories = ["All", "Challenge", "Leaderboard", "Content", "Platform", "Referrals", "Community"];

  // Use dynamic data or fallback (only if not loading and API failed)
  // Don't show fallback while loading - show skeleton instead
  const displayNews = loading ? [] : (newsItems.length > 0 ? newsItems : (error ? fallbackNewsItems : []));
  
  // Filter news based on search and category
  const filteredNews = displayNews.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === "All" || 
                           (item.tags && item.tags.includes(selectedCategory)) ||
                           (item as any).category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Challenge: "from-emerald-500 to-emerald-600",
      Leaderboard: "from-blue-500 to-blue-600",
      Content: "from-purple-500 to-purple-600",
      Platform: "from-orange-500 to-orange-600",
      Referrals: "from-pink-500 to-pink-600",
      Community: "from-indigo-500 to-indigo-600"
    };
    return colors[category] || "from-slate-500 to-slate-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
              PineCoin News
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Stay updated with the latest features, challenges, community news, and platform updates
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-200/50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`${
                      selectedCategory === category 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                        : "border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured News */}
        {!loading && filteredNews.filter(item => item.featured).length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Star className="w-6 h-6 text-amber-500 mr-2" />
              Featured News
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredNews.filter(item => item.featured).map((news) => (
                <Card key={news.id} className="bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Featured Image */}
                  {news.featured_image && (
                    <div className="relative h-64 w-full">
                      <img
                        src={news.featured_image.startsWith('http') 
                          ? news.featured_image 
                          : `${process.env.NEXT_PUBLIC_API_BASE || 'https://casinobackend-production-66bf.up.railway.app'}/api/news/images/${news.featured_image.split('/').pop()}`
                        }
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`bg-gradient-to-r ${getCategoryColor((news as any).category || (news.tags && news.tags[0]) || 'News')} text-white`}>
                          {(news as any).category || (news.tags && news.tags[0]) || 'News'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className={news.featured_image ? '' : 'pb-2'}>
                    <div className="flex items-center justify-between mb-2">
                      {!news.featured_image && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor((news as any).category || (news.tags && news.tags[0]) || 'News')} text-white`}>
                          {(news as any).category || (news.tags && news.tags[0]) || 'News'}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {news.published_at ? new Date(news.published_at).toLocaleDateString() : (news as any).date}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-slate-800 line-clamp-2">
                      {news.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-slate-500">
                      <User className="w-4 h-4 mr-1" />
                      {news.author_name || (news as any).author} • {(news as any).readTime || '2 min read'}
                      {news.views && (
                        <>
                          <Eye className="w-4 h-4 ml-2 mr-1" />
                          {news.views} views
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{news.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(news.tags || []).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/news/${news.slug || (news as any).id}`}>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                        Read Full Article
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* All News Grid */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-emerald-500 mr-2" />
            Latest News
          </h2>
          
          {loading ? (
            <div className="space-y-6">
              {/* Featured Article Skeleton */}
              <Card className="bg-white/80 border-slate-200/50 shadow-lg">
                <div className="relative">
                  <div className="h-64 bg-slate-200 rounded-t-lg animate-pulse"></div>
                  <div className="absolute top-4 left-4">
                    <div className="h-6 bg-slate-300 rounded-full w-20 animate-pulse"></div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="h-8 bg-slate-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6 mb-4 animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>

              {/* News Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="bg-white/80 border-slate-200/50 shadow-lg">
                    <div className="h-48 bg-slate-200 rounded-t-lg animate-pulse"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse"></div>
                          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : paginatedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Featured Image */}
                  {news.featured_image && (
                    <div className="relative h-48 w-full">
                      <img
                        src={news.featured_image.startsWith('http') 
                          ? news.featured_image 
                          : `${process.env.NEXT_PUBLIC_API_BASE || 'https://casinobackend-production-66bf.up.railway.app'}/api/news/images/${news.featured_image.split('/').pop()}`
                        }
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className={`bg-gradient-to-r ${getCategoryColor((news as any).category || (news.tags && news.tags[0]) || 'News')} text-white`}>
                          {(news as any).category || (news.tags && news.tags[0]) || 'News'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className={news.featured_image ? '' : 'pb-2'}>
                    <div className="flex items-center justify-between mb-2">
                      {!news.featured_image && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor((news as any).category || (news.tags && news.tags[0]) || 'News')} text-white`}>
                          {(news as any).category || (news.tags && news.tags[0]) || 'News'}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {news.published_at ? new Date(news.published_at).toLocaleDateString() : (news as any).date}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-800 line-clamp-2">
                      {news.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-slate-500">
                      <User className="w-4 h-4 mr-1" />
                      {news.author_name || (news as any).author} • {(news as any).readTime || '2 min read'}
                      {news.views && (
                        <>
                          <Eye className="w-4 h-4 ml-2 mr-1" />
                          {news.views} views
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{news.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(news.tags || []).slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/news/${news.slug || (news as any).id}`}>
                      <Button variant="outline" className="w-full border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50">
                        Read More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No news articles found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center items-center space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={`${
                    currentPage === page 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                      : "border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                  } w-10 h-10 p-0`}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-emerald-100" />
              <h3 className="text-2xl font-bold mb-2">Stay Updated!</h3>
              <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
                Get the latest PineCoin news, challenges, and updates delivered directly to your inbox. 
                Never miss an opportunity to earn more points!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 border-0 text-slate-800 placeholder-slate-500"
                />
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50 px-6">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
