"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, User, ArrowLeft, ArrowRight, TrendingUp, Star, Zap, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { resolveNewsImageUrl } from "@/lib/news-image";

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
  category?: string;
}

export default function NewsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://pinecrest.konhito.me";
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
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const fetchNewsArticles = async () => {
    try {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'All') params.append('category', selectedCategory.toLowerCase());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/news?${params}`);

      if (response.ok) {
        const result = await response.json();
        const articles = result?.data?.articles;
        setNewsItems(Array.isArray(articles) ? articles : []);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/news?featured=true&limit=1`);
      if (response.ok) {
        const result = await response.json();
        const articles = result?.data?.articles;
        if (Array.isArray(articles) && articles.length > 0) {
          setFeaturedArticle(articles[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching featured article:', error);
    }
  };

  // Sample news data - fallback if API fails (shaped as NewsArticle)
  const fallbackNewsItems: NewsArticle[] = [
    { id: 1, title: "New Social Media Challenge: Share Your Success Story", slug: "social-media-challenge", excerpt: "Share your PineCoin journey and earn up to 50 points!", content: "", featured_image: null, author_name: "PineCoin Team", published_at: new Date().toISOString(), views: 0, featured: true, tags: ["challenge", "social media", "rewards"] },
    { id: 2, title: "Weekly Leaderboard Winners Announced", slug: "weekly-leaderboard", excerpt: "Congratulations to this week's top performers!", content: "", featured_image: null, author_name: "PineCoin Team", published_at: new Date().toISOString(), views: 0, featured: false, tags: ["leaderboard", "winners", "rewards"] },
    { id: 3, title: "New Video Content Available for Rewards", slug: "video-content-rewards", excerpt: "Watch our latest videos and earn points instantly.", content: "", featured_image: null, author_name: "Content Team", published_at: new Date().toISOString(), views: 0, featured: false, tags: ["videos", "content", "points"] },
    { id: 4, title: "Platform Update: Enhanced Security Features", slug: "security-features", excerpt: "We've implemented new security measures to protect your account.", content: "", featured_image: null, author_name: "Security Team", published_at: new Date().toISOString(), views: 0, featured: true, tags: ["security", "platform", "updates"] },
    { id: 5, title: "Referral Program Success Stories", slug: "referral-success", excerpt: "Discover how our top referrers are earning hundreds of points.", content: "", featured_image: null, author_name: "Community Team", published_at: new Date().toISOString(), views: 0, featured: false, tags: ["referrals", "success stories", "community"] },
    { id: 6, title: "Monthly Community Spotlight: Meet Our Top Users", slug: "community-spotlight", excerpt: "Get to know the PineCoin community's most active users.", content: "", featured_image: null, author_name: "Community Team", published_at: new Date().toISOString(), views: 0, featured: true, tags: ["community", "spotlight", "users"] }
  ];

  // Use dynamic data or fallback (only if not loading and API failed)
  // Don't show fallback while loading - show skeleton instead
  const displayNews = loading ? [] : (newsItems.length > 0 ? newsItems : (error ? fallbackNewsItems : []));

  const categories = Array.from(
    new Set([
      "All",
      "General",
      "Crypto",
      "Rewards",
      "Updates",
      "Announcements",
      ...displayNews
        .map((item) => item.category?.trim())
        .filter((category): category is string => Boolean(category))
        .map((category) => category.charAt(0).toUpperCase() + category.slice(1))
    ])
  );

  // Filter news based on search and category
  const filteredNews = displayNews.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory =
      selectedCategory === "All" ||
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "from-slate-500 to-slate-600",
      crypto: "from-amber-500 to-amber-600",
      rewards: "from-emerald-500 to-emerald-600",
      updates: "from-blue-500 to-blue-600",
      announcements: "from-purple-500 to-purple-600"
    };
    return colors[category.toLowerCase()] || "from-slate-500 to-slate-600";
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
            <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors mr-4">
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
                    className={`${selectedCategory === category
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
                        src={resolveNewsImageUrl(news.featured_image, apiBase) || undefined}
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(news.category || 'general')} text-white`}>
                          {news.category || 'general'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className={news.featured_image ? '' : 'pb-2'}>
                    <div className="flex items-center justify-between mb-2">
                      {!news.featured_image && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(news.category || 'general')} text-white`}>
                          {news.category || 'general'}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {news.published_at ? new Date(news.published_at).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-slate-800 break-words whitespace-normal">
                      {news.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-slate-500">
                      <User className="w-4 h-4 mr-1" />
                      {news.author_name} • 2 min read
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
                    <Link href={`/news/${encodeURIComponent(news.slug || String(news.id))}`}>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
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
                          src={resolveNewsImageUrl(news.featured_image, apiBase) || undefined}
                          alt={news.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className={`bg-gradient-to-r ${getCategoryColor(news.category || 'general')} text-white`}>
                            {news.category || 'general'}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <CardHeader className={news.featured_image ? '' : 'pb-2'}>
                      <div className="flex items-center justify-between mb-2">
                        {!news.featured_image && (
                          <Badge className={`bg-gradient-to-r ${getCategoryColor(news.category || 'general')} text-white`}>
                            {news.category || 'general'}
                          </Badge>
                        )}
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {news.published_at ? new Date(news.published_at).toLocaleDateString() : '—'}
                        </div>
                      </div>
                      <CardTitle className="text-lg text-slate-800 break-words whitespace-normal">
                        {news.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-slate-500">
                        <User className="w-4 h-4 mr-1" />
                        {news.author_name} • 2 min read
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
                      <Link href={`/news/${encodeURIComponent(news.slug || String(news.id))}`}>
                        <Button variant="outline" className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold transition-all">
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
                  className={`${currentPage === page
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
                  className="flex-1 bg-white border-2 border-white text-slate-800 placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/50"
                />
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold px-8 shadow-md hover:shadow-lg transition-all">
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
