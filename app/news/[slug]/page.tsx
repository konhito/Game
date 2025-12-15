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
  const [linkedContent, setLinkedContent] = useState<string>("");

  useEffect(() => {
    if (params.slug) {
      fetchArticle(params.slug as string);
    }
  }, [params.slug]);

  const fetchArticle = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.up.railway.app'}/api/news/${slug}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.article) {
          const art = result.data.article as NewsArticle;
          setArticle(art);

          // Preprocess content to make plain URLs clickable
          const urlRegex = /(https?:\/\/[^\s<]+)/g;
          const htmlContent = art.content
            .replace(/\n/g, "<br />")
            .replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 underline">${url}</a>`);
          setLinkedContent(htmlContent);
          
          // Fetch related articles
          await fetchRelatedArticles(art.tags);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.up.railway.app'}/api/news?tag=${tagParam}&limit=3`);
      
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => router.push('/news')}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Article Header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl overflow-hidden">
                {/* Featured Image */}
                {article.featured_image && (
                  <div className="relative h-[400px] md:h-[500px] w-full">
                    <img
                      src={article.featured_image.startsWith('http') 
                        ? article.featured_image 
                        // Support both POSIX (/) and Windows (\) paths saved from multer
                        : `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.up.railway.app'}/api/news/images/${article.featured_image.split(/[\\/]/).pop()}`
                      }
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute top-6 left-6">
                      {article.tags && article.tags.length > 0 && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(article.tags[0])} text-white px-4 py-2 text-sm font-medium shadow-lg`}>
                          {article.tags[0]}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-6 right-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareArticle}
                        className="bg-white/90 backdrop-blur-sm border-white/20 text-slate-700 hover:bg-white hover:text-slate-900 shadow-lg"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}
                
                <CardHeader className="p-8">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {!article.featured_image && article.tags && article.tags.length > 0 && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(article.tags[0])} text-white px-4 py-2 text-sm font-medium`}>
                          {article.tags[0]}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(article.published_at)}
                      </div>
                    </div>
                    {!article.featured_image && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareArticle}
                        className="border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    )}
                  </div>

                  {/* Title */}
                  <CardTitle className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-6">
                    {article.title}
                  </CardTitle>

                  {/* Excerpt */}
                  <CardDescription className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                    {article.excerpt}
                  </CardDescription>

                  {/* Author and Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full">
                      <User className="w-5 h-5 mr-3" />
                      <span className="font-semibold">{article.author_name}</span>
                    </div>
                    <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full">
                      <Clock className="w-5 h-5 mr-3" />
                      <span className="font-medium">5 min read</span>
                    </div>
                    {article.views && (
                      <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full">
                        <Eye className="w-5 h-5 mr-3" />
                        <span className="font-medium">{article.views} views</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Article Content */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg prose-slate max-w-none">
                    <div 
                      className="text-slate-700 leading-relaxed text-lg"
                      style={{
                        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        lineHeight: '1.8'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: linkedContent || article.content.replace(/\n/g, '<br />') 
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
                <Card className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Tag className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Article Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {article.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-sm px-4 py-2 hover:bg-emerald-100 hover:text-emerald-700 cursor-pointer transition-all duration-200 hover:scale-105 bg-slate-100 text-slate-700"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Table of Contents */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-500" />
                      Quick Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <User className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Author</p>
                        <p className="font-semibold text-slate-800">{article.author_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Published</p>
                        <p className="font-semibold text-slate-800">{formatDate(article.published_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Clock className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Read Time</p>
                        <p className="font-semibold text-slate-800">5 min read</p>
                      </div>
                    </div>
                    {article.views && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Eye className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-500">Views</p>
                          <p className="font-semibold text-slate-800">{article.views}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Share Article */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-emerald-500" />
                      Share Article
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={shareArticle}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share This Article
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
                <BookOpen className="w-8 h-8 text-emerald-500" />
                Related Articles
              </h3>
              <p className="text-lg text-slate-600">Discover more interesting content</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <motion.div
                  key={relatedArticle.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
                    onClick={() => router.push(`/news/${relatedArticle.slug}`)}
                  >
                    {/* Featured Image */}
                    {relatedArticle.featured_image && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={relatedArticle.featured_image.startsWith('http') 
                            ? relatedArticle.featured_image 
                            // Support both POSIX (/) and Windows (\) paths
                            : `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.up.railway.app'}/api/news/images/${relatedArticle.featured_image.split(/[\\/]/).pop()}`
                          }
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          {relatedArticle.tags && relatedArticle.tags.length > 0 && (
                            <Badge className={`bg-gradient-to-r ${getCategoryColor(relatedArticle.tags[0])} text-white px-3 py-1 text-xs font-medium`}>
                              {relatedArticle.tags[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="p-6">
                      {!relatedArticle.featured_image && relatedArticle.tags && relatedArticle.tags.length > 0 && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(relatedArticle.tags[0])} text-white w-fit mb-3`}>
                          {relatedArticle.tags[0]}
                        </Badge>
                      )}
                      <CardTitle className="text-xl text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {relatedArticle.title}
                      </CardTitle>
                      <CardDescription className="text-slate-600 line-clamp-3 mt-2">
                        {relatedArticle.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{relatedArticle.author_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(relatedArticle.published_at)}</span>
                        </div>
                      </div>
                      {relatedArticle.views && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                          <Eye className="w-4 h-4" />
                          <span>{relatedArticle.views} views</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to News CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Enjoyed this article?</h3>
                <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                  Discover more exciting news, updates, and insights from the PineCoin community!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={() => router.push('/news')}
                    className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read More Articles
                  </Button>
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="border-white/30 text-black hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

