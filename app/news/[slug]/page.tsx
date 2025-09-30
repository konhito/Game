"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Eye, Clock, Share2, BookOpen, Tag } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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
  meta_title?: string;
  meta_description?: string;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    if (params.slug) {
      fetchArticle(params.slug as string);
    }
  }, [params.slug]);

  const fetchArticle = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://casino-backend-obvo.onrender.com'}/api/news/${slug}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.article) {
          setArticle(result.data.article);
          
          // Fetch related articles
          await fetchRelatedArticles(result.data.article.tags);
        } else {
          setError('Article not found');
        }
      } else if (response.status === 404) {
        setError('Article not found');
      } else {
        setError('Failed to load article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (tags: string[]) => {
    try {
      if (tags.length === 0) return;
      
      const tagParam = tags[0]; // Use first tag for related articles
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://casino-backend-obvo.onrender.com'}/api/news?tag=${tagParam}&limit=3`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.articles) {
          setRelatedArticles(result.data.articles);
        }
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      challenge: "from-emerald-500 to-emerald-600",
      leaderboard: "from-blue-500 to-blue-600",
      content: "from-purple-500 to-purple-600",
      platform: "from-orange-500 to-orange-600",
      referrals: "from-pink-500 to-pink-600",
      community: "from-indigo-500 to-indigo-600",
      news: "from-slate-500 to-slate-600"
    };
    return colors[tag.toLowerCase()] || "from-slate-500 to-slate-600";
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-slate-600 text-lg">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/news')} className="bg-emerald-500 hover:bg-emerald-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => router.push('/news')}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </motion.div>

        {/* Article Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg">
            <CardHeader className="pb-4">
              {/* Category and Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {article.tags && article.tags.length > 0 && (
                    <Badge className={`bg-gradient-to-r ${getCategoryColor(article.tags[0])} text-white`}>
                      {article.tags[0]}
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.published_at)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareArticle}
                  className="border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Title */}
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                {article.title}
              </CardTitle>

              {/* Excerpt */}
              <CardDescription className="text-lg text-slate-600 mt-4">
                {article.excerpt}
              </CardDescription>

              {/* Author and Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center text-slate-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">{article.author_name}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>5 min read</span>
                </div>
                {article.views && (
                  <div className="flex items-center text-slate-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{article.views} views</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Featured Image */}
        {article.featured_image && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={article.featured_image} 
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content.replace(/\n/g, '<br />') 
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-800">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-sm px-3 py-1 hover:bg-emerald-100 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 text-emerald-500 mr-2" />
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Card 
                  key={relatedArticle.id} 
                  className="bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/news/${relatedArticle.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {relatedArticle.tags && relatedArticle.tags.length > 0 && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(relatedArticle.tags[0])} text-white`}>
                          {relatedArticle.tags[0]}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(relatedArticle.published_at)}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-800 line-clamp-2">
                      {relatedArticle.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm line-clamp-3">{relatedArticle.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to News CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">Enjoyed this article?</h3>
              <p className="text-emerald-100 mb-6">
                Check out more news and updates from PineCoin!
              </p>
              <Button 
                onClick={() => router.push('/news')}
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Read More Articles
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

