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
  meta_title?: string;
  meta_description?: string;
}

export default function ArticlePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://pinecrest.konhito.me";
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    const rawSlug = params.slug;
    const slugValue = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    if (slugValue) {
      fetchArticle(slugValue);
    }
  }, [params.slug]);

  const fetchArticle = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const encodedSlug = encodeURIComponent(slug);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/news/${encodedSlug}`);

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
      // Validate tags is an array and has elements
      if (!tags || !Array.isArray(tags) || tags.length === 0) return;

      const tagParam = tags[0]; // Use first tag for related articles

      // Ensure tagParam is a valid string
      if (!tagParam || typeof tagParam !== 'string') return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/news?tag=${encodeURIComponent(tagParam)}&limit=3`);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.articles) {
          setRelatedArticles(result.data.articles);
        }
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
      // Silently fail - related articles are optional
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

  const normalizeHref = (rawValue: string): string => {
    const value = rawValue.trim();
    if (!value) return value;
    if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
    if (value.includes('@') && !value.includes('/')) return `mailto:${value}`;
    return `https://${value}`;
  };

  const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const escapeAttribute = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // Convert URLs in text to clickable links
  const convertUrlsToLinks = (text: string): string => {
    if (!text || typeof text !== 'string') return '';

    // URL regex pattern - matches http, https, www, and email addresses
    const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+|[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    const anchorPattern = /(<a\b[^>]*>[\s\S]*?<\/a>)/gi;

    return text
      .split(anchorPattern)
      .map((segment) => {
        if (/^<a\b[^>]*>[\s\S]*<\/a>$/i.test(segment)) {
          return segment;
        }

        return segment.replace(urlPattern, (rawMatch) => {
          let match = rawMatch;
          let trailing = "";

          // Keep trailing punctuation outside anchor.
          while (/[),.;!?]$/.test(match)) {
            trailing = match.slice(-1) + trailing;
            match = match.slice(0, -1);
          }

          if (!match) return rawMatch;

          const href = normalizeHref(match);
          const escapedUrl = escapeHtml(match);
          const escapedHref = escapeAttribute(href);

          return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline font-medium transition-colors cursor-pointer">${escapedUrl}</a>${trailing}`;
        });
      })
      .join("");
  };

  // Process content: convert markdown to HTML
  const processContent = (content: string): string => {
    if (!content || typeof content !== 'string') return '';

    let processed = content;

    // Convert markdown links [text](url) to HTML links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const normalizedHref = normalizeHref(url);
      const escapedUrl = escapeAttribute(normalizedHref);
      const escapedText = escapeHtml(text);
      return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline font-medium transition-colors cursor-pointer">${escapedText}</a>`;
    });

    // Convert **bold** to <strong>
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>');

    // Convert *italic* to <em>
    processed = processed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Convert lists (- item or * item) to HTML lists
    // First, find all list blocks
    processed = processed.replace(/((?:^|\n)(?:[-*]\s+.+(?:\n|$))+)/gm, (listBlock) => {
      // Convert each list item
      const items = listBlock
        .trim()
        .split('\n')
        .map(line => {
          const match = line.match(/^[-*]\s+(.+)$/);
          if (match) {
            return `<li class="ml-6 mb-2">${match[1]}</li>`;
          }
          return '';
        })
        .filter(item => item)
        .join('\n');

      return `<ul class="list-disc my-4 space-y-2">\n${items}\n</ul>`;
    });

    // Convert remaining plain URLs to links (that aren't already in markdown or HTML)
    processed = convertUrlsToLinks(processed);

    // Convert newlines to breaks (but not inside HTML tags we just created)
    processed = processed.replace(/\n/g, '<br />');

    return processed;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "from-slate-500 to-slate-600",
      crypto: "from-amber-500 to-amber-600",
      rewards: "from-emerald-500 to-emerald-600",
      updates: "from-blue-500 to-blue-600",
      announcements: "from-cyan-600 to-teal-600"
    };
    return colors[category.toLowerCase()] || "from-slate-500 to-slate-600";
  };

  const getReadTime = (content: string) => {
    const plainText = content.replace(/<[^>]+>/g, " ").trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(wordCount / 220));
  };

  const shareArticle = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href
        });
        setShareStatus("Shared successfully.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link copied to clipboard.");
      } else {
        setShareStatus("Sharing is not supported on this device.");
      }
    } catch (shareError) {
      setShareStatus("Unable to share right now. Please try again.");
    } finally {
      setTimeout(() => setShareStatus(null), 2500);
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
    <div className="min-h-screen bg-slate-50">
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
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white border-slate-200 shadow-lg overflow-hidden">
                {/* Featured Image */}
                {article.featured_image && (
                  <div className="relative h-[400px] md:h-[500px] w-full">
                    <img
                      src={resolveNewsImageUrl(article.featured_image, apiBase) || undefined}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src.endsWith("/Icon.png")) return;
                        console.error("News hero image failed to load:", target.src);
                        target.src = "/Icon.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute top-6 left-6">
                      {article.category && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(article.category)} text-white px-4 py-2 text-sm font-medium shadow-lg`}>
                          {article.category}
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
                      {!article.featured_image && article.category && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(article.category)} text-white px-4 py-2 text-sm font-medium`}>
                          {article.category}
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
                      <span className="font-medium">{getReadTime(article.content)} min read</span>
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

            {shareStatus && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {shareStatus}
              </div>
            )}

            {/* Article Content */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg prose-slate max-w-none">
                    <div
                      className="text-slate-700 leading-relaxed text-lg"
                      style={{
                        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        lineHeight: '1.8'
                      }}
                      dangerouslySetInnerHTML={{
                        __html: processContent(article.content)
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
                <Card className="bg-white border-slate-200 shadow-lg">
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
                          className="text-sm px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 cursor-pointer transition-all duration-200"
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
              {/* Share Article */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-white border-slate-200 shadow-lg">
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
                  <Link href={`/news/${encodeURIComponent(relatedArticle.slug)}`} className="block">
                    <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    {/* Featured Image */}
                    {relatedArticle.featured_image && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={resolveNewsImageUrl(relatedArticle.featured_image, apiBase) || undefined}
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src.endsWith("/Icon.png")) return;
                            console.error("Related news image failed to load:", target.src);
                            target.src = "/Icon.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          {relatedArticle.category && (
                            <Badge className={`bg-gradient-to-r ${getCategoryColor(relatedArticle.category)} text-white px-3 py-1 text-xs font-medium`}>
                              {relatedArticle.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <CardHeader className="p-6">
                      {!relatedArticle.featured_image && relatedArticle.category && (
                        <Badge className={`bg-gradient-to-r ${getCategoryColor(relatedArticle.category)} text-white w-fit mb-3`}>
                          {relatedArticle.category}
                        </Badge>
                      )}
                      <CardTitle className="text-xl text-slate-800 break-words whitespace-normal group-hover:text-emerald-600 transition-colors">
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
                  </Link>
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
                    className="bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 border border-white px-8 py-4 text-lg font-semibold transition-all"
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

