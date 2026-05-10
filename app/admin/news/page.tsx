"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  Globe,
  Lock,
  Upload,
  X,
  Link2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Save,
  Clock,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import config from "@/lib/config";
import { resolveNewsImageUrl } from "@/lib/news-image";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author_name: string;
  status: 'draft' | 'published';
  published_at: string | null;
  views: number;
  featured: boolean;
  tags: string[];
  category?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

const hasMeaningfulText = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (tags === null || tags === undefined) return [];

  const raw = String(tags).trim();
  if (!raw || raw === "{}" || raw === "()" || raw === "[]") return [];

  if (raw.startsWith("{") && raw.endsWith("}")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch (_) {}
  }

  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "draft" as "draft" | "published",
    featured: false,
    tags: [] as string[],
    category: "general",
    meta_title: "",
    meta_description: "",
    scheduled_publish: ""
  });
  const [newTag, setNewTag] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [selectedLinkText, setSelectedLinkText] = useState("");
  const [linkSelection, setLinkSelection] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, statusFilter]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if ((showCreateForm || editingArticle) && formData.title) {
      const autoSaveInterval = setInterval(() => {
        handleAutoSave();
      }, 30000); // 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [formData, showCreateForm, editingArticle]);

  const handleAutoSave = async () => {
    if (!formData.title || formData.status !== 'draft') return;

    setAutoSaving(true);
    // Simulate auto-save (you can implement actual API call)
    setTimeout(() => {
      setAutoSaving(false);
      setLastSaved(new Date());
    }, 500);
  };

  // Calculate word and character count
  const getContentStats = () => {
    const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = formData.content.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min
    return { wordCount, charCount, readingTime };
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Insert link at cursor position
  const insertLink = () => {
    const rawUrl = linkUrl.trim();
    if (!rawUrl) return;

    const textarea = contentRef.current;
    const start = linkSelection?.start ?? textarea?.selectionStart ?? formData.content.length;
    const end = linkSelection?.end ?? textarea?.selectionEnd ?? start;
    const selectedText = formData.content.substring(start, end).trim();
    const anchorText = (linkText.trim() || selectedText || selectedLinkText || rawUrl).trim();
    const normalizedUrl = /^(https?:\/\/|mailto:)/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const linkMarkdown = `[${anchorText}](${normalizedUrl})`;
    const newContent = formData.content.substring(0, start) + linkMarkdown + formData.content.substring(end);

    setFormData({ ...formData, content: newContent });
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
    setSelectedLinkText("");
    setLinkSelection(null);

    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + linkMarkdown.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const openLinkDialog = () => {
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? formData.content.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = formData.content.substring(start, end).trim();

    setLinkSelection({ start, end });
    setSelectedLinkText(selected);
    setLinkText(selected);
    setShowLinkDialog(true);
  };

  // Insert formatting
  const insertFormatting = (type: 'bold' | 'italic' | 'list') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let formattedText = "";
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'list item'}\n- item 2\n- item 3`;
        break;
    }

    const newContent = formData.content.substring(0, start) + formattedText + formData.content.substring(end);
    setFormData({ ...formData, content: newContent });

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${config.API_BASE}/api/news/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const normalizedArticles = (result?.data?.articles ?? []).map((article: NewsArticle) => ({
          ...article,
          tags: parseTags(article.tags),
        }));
        setArticles(normalizedArticles);
      } else {
        console.error('Failed to fetch articles');
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setSubmitError('You must be logged in to create articles.');
        setSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('meta_title', formData.meta_title);
      formDataToSend.append('meta_description', formData.meta_description);

      if (selectedFile) {
        formDataToSend.append('featured_image', selectedFile);
      } else if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }

      const response = await fetch(`${config.API_BASE}/api/news/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setShowCreateForm(false);
        resetForm();
        fetchArticles();
      } else {
        setSubmitError(result?.error || 'Failed to create article. Please try again.');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setSubmitError('You must be logged in to update articles.');
        setSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('meta_title', formData.meta_title);
      formDataToSend.append('meta_description', formData.meta_description);

      if (selectedFile) {
        formDataToSend.append('featured_image', selectedFile);
      } else if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }

      const response = await fetch(`${config.API_BASE}/api/news/admin/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setEditingArticle(null);
        resetForm();
        fetchArticles();
      } else {
        setSubmitError(result?.error || 'Failed to update article. Please try again.');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/news/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchArticles();
      } else {
        console.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedArticles.length} article(s)?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      await Promise.all(
        selectedArticles.map(id =>
          fetch(`${config.API_BASE}/api/news/admin/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        )
      );
      setSelectedArticles([]);
      fetchArticles();
    } catch (error) {
      console.error('Error bulk deleting articles:', error);
    }
  };

  const handleTogglePublish = async (article: NewsArticle) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'publish' : 'unpublish';

    if (!confirm(`Are you sure you want to ${action} this article?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/news/admin/${article.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        }),
      });

      if (response.ok) {
        fetchArticles();
      } else {
        console.error(`Failed to ${action} article`);
        alert(`Failed to ${action} article. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing article:`, error);
      alert(`Error ${action}ing article. Please try again.`);
    }
  };

  const applyArticleToForm = (article: NewsArticle) => {
    const safeContent = hasMeaningfulText(article.content)
      ? article.content
      : hasMeaningfulText(formData.content)
        ? formData.content
        : "";

    setSubmitError(null);
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: safeContent,
      featured_image: article.featured_image || "",
      status: article.status,
      featured: article.featured,
      tags: parseTags(article.tags),
      category: article.category || "general",
      meta_title: article.meta_title ?? "",
      meta_description: article.meta_description ?? "",
      scheduled_publish: ""
    });
    setNewTag("");
    if (article.featured_image) {
      setImagePreview(resolveNewsImageUrl(article.featured_image, config.API_BASE));
    } else {
      setImagePreview(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const mergeArticleForEdit = (base: NewsArticle, incoming: Partial<NewsArticle>): NewsArticle => {
    const merged = { ...base, ...incoming } as NewsArticle;

    if (!hasMeaningfulText(incoming.content) && hasMeaningfulText(base.content)) {
      merged.content = base.content;
    }

    if (!hasMeaningfulText(incoming.title) && hasMeaningfulText(base.title)) {
      merged.title = base.title;
    }

    if (!hasMeaningfulText(incoming.excerpt) && hasMeaningfulText(base.excerpt)) {
      merged.excerpt = base.excerpt;
    }

    return merged;
  };

  const startEdit = async (article: NewsArticle) => {
    // Show current article data immediately so the editor never opens empty.
    applyArticleToForm(article);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return;
      }

      const response = await fetch(`${config.API_BASE}/api/news/admin/${article.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const fullArticle = result?.data?.article;
        if (fullArticle) {
          applyArticleToForm(
            mergeArticleForEdit(article, {
              ...fullArticle,
              tags: parseTags(fullArticle.tags),
            })
          );
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching full article for edit:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      status: "draft",
      featured: false,
      tags: [],
      category: "general",
      meta_title: "",
      meta_description: "",
      scheduled_publish: ""
    });
    setNewTag("");
    clearFile();
    setSubmitError(null);
    setLastSaved(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleArticleSelection = (id: number) => {
    setSelectedArticles(prev =>
      prev.includes(id) ? prev.filter(articleId => articleId !== id) : [...prev, id]
    );
  };

  const stats = getContentStats();
  const categorySuggestions = Array.from(
    new Set([
      "general",
      "crypto",
      "rewards",
      "updates",
      "announcements",
      ...articles
        .map((article) => article.category?.trim().toLowerCase())
        .filter((category): category is string => Boolean(category)),
      formData.category.trim().toLowerCase(),
    ].filter(Boolean))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">News Management</h1>
            <p className="text-slate-600">Create and manage news articles with advanced features</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </div>

        {/* Filters and Bulk Actions */}
        <Card className="mb-6 shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <Label htmlFor="search">Search Articles</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by title, content, or excerpt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status">Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Articles</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedArticles.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedArticles.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                        className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        {article.featured_image && (
                          <img
                            src={resolveNewsImageUrl(article.featured_image, config.API_BASE) || undefined}
                            alt={article.title}
                            className="w-full max-w-md h-36 object-cover rounded-lg mb-3 border border-slate-200"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/Icon.png";
                            }}
                          />
                        )}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-slate-800">{article.title}</h3>
                          <Badge variant={article.status === 'published' ? 'default' : 'secondary'} className="font-semibold">
                            {article.status}
                          </Badge>
                          {article.featured && (
                            <Badge variant="outline" className="text-amber-600 border-amber-600 font-semibold">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 mb-3 line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(article.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views} views
                          </div>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {article.tags.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant={article.status === 'published' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTogglePublish(article)}
                        className={article.status === 'published'
                          ? 'bg-green-600 hover:bg-green-700 text-white font-semibold'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300 font-semibold'
                        }
                      >
                        {article.status === 'published' ? (
                          <>
                            <Lock className="w-4 h-4 mr-1" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(article)}
                        className="font-semibold"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingArticle) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8"
            >
              <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {editingArticle ? 'Edit Article' : 'Create New Article'}
                    </h2>
                    {lastSaved && (
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Last saved: {lastSaved.toLocaleTimeString()}
                      </p>
                    )}
                    {autoSaving && (
                      <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        Auto-saving...
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
                {submitError && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}
              </div>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none px-6 bg-slate-50">
                  <TabsTrigger value="content" className="data-[state=active]:bg-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="data-[state=active]:bg-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    SEO & Meta
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-white">
                    <Globe className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={editingArticle ? handleUpdateArticle : handleCreateArticle} className="max-h-[calc(90vh-200px)] overflow-y-auto">
                  <TabsContent value="content" className="p-6 space-y-6">
                    {showPreview ? (
                      <div className="prose prose-slate max-w-none bg-slate-50 p-8 rounded-lg">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">{formData.title || 'Untitled Article'}</h1>
                        <p className="text-xl text-slate-600 mb-6">{formData.excerpt}</p>
                        {imagePreview && (
                          <img src={imagePreview} alt="Featured" className="w-full h-64 object-cover rounded-lg mb-6" />
                        )}
                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {formData.content}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {formData.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="title" className="text-slate-700 font-semibold">Title *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Enter article title"
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="slug" className="text-slate-700 font-semibold">Slug</Label>
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                              placeholder="article-slug (auto-generated if empty)"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="excerpt" className="text-slate-700 font-semibold">Excerpt</Label>
                          <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Brief description of the article"
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="content" className="text-slate-700 font-semibold">Content *</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => insertFormatting('bold')}
                                title="Bold"
                              >
                                <Bold className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => insertFormatting('italic')}
                                title="Italic"
                              >
                                <Italic className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => insertFormatting('list')}
                                title="List"
                              >
                                <List className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openLinkDialog}
                                title="Insert Link"
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <LinkIcon className="w-4 h-4 mr-1" />
                                Link
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            ref={contentRef}
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your article content here... You can use markdown formatting and insert links."
                            rows={12}
                            required
                            className="mt-1 font-mono text-sm"
                          />
                          <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                            <div className="flex gap-4">
                              <span>{stats.wordCount} words</span>
                              <span>{stats.charCount} characters</span>
                              <span>{stats.readingTime} min read</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="featured_image" className="text-slate-700 font-semibold">Featured Image</Label>
                            <div className="space-y-4 mt-1">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                  id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-600 font-medium">
                                    Click to upload an image
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF, WebP up to 10MB
                                  </p>
                                </label>
                              </div>

                              {imagePreview && (
                                <div className="relative">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={clearFile}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}

                              <div className="text-center text-sm text-gray-500">OR</div>
                              <Input
                                id="featured_image"
                                value={formData.featured_image}
                                onChange={(e) => {
                                  const nextValue = e.target.value;
                                  setFormData({ ...formData, featured_image: nextValue });
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                  setImagePreview(nextValue ? resolveNewsImageUrl(nextValue, config.API_BASE) : null);
                                }}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status" className="text-slate-700 font-semibold">Status</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="category" className="text-slate-700 font-semibold">Category</Label>
                              <Input
                                id="category"
                                list="news-category-options"
                                value={formData.category}
                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                placeholder="general"
                                className="mt-1"
                              />
                              <datalist id="news-category-options">
                                {categorySuggestions.map((categoryOption) => (
                                  <option key={categoryOption} value={categoryOption} />
                                ))}
                              </datalist>
                              <p className="text-xs text-slate-500 mt-1">Pick an existing category or type a new one.</p>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                              <input
                                type="checkbox"
                                id="featured"
                                checked={formData.featured}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <label htmlFor="featured" className="text-sm text-slate-700 font-medium">
                                Featured Article
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="tags" className="text-slate-700 font-semibold">Tags</Label>
                          <div className="space-y-2 mt-1">
                            <div className="flex gap-2">
                              <Input
                                id="tags"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleTagKeyPress}
                                placeholder="Enter a tag and press Enter"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                onClick={handleAddTag}
                                variant="outline"
                                className="shrink-0"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Tag
                              </Button>
                            </div>
                            {formData.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-1 px-3 py-1"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTag(tag)}
                                      className="ml-1 hover:text-red-600 focus:outline-none"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {formData.tags.length === 0 && (
                              <p className="text-sm text-slate-500 italic">No tags added yet. Add tags to categorize your article.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="seo" className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        SEO Optimization
                      </h3>
                      <p className="text-sm text-blue-700">
                        Optimize your article for search engines. Meta title and description help improve visibility in search results.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="meta_title" className="text-slate-700 font-semibold">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="SEO meta title (recommended: 50-60 characters)"
                        className="mt-1"
                      />
                      <p className="text-sm text-slate-500 mt-1">{formData.meta_title.length} / 60 characters</p>
                    </div>

                    <div>
                      <Label htmlFor="meta_description" className="text-slate-700 font-semibold">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        placeholder="SEO meta description (recommended: 150-160 characters)"
                        rows={3}
                        className="mt-1"
                      />
                      <p className="text-sm text-slate-500 mt-1">{formData.meta_description.length} / 160 characters</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="p-6 space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Publishing Settings
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Configure when and how your article will be published.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="scheduled_publish" className="text-slate-700 font-semibold">Schedule Publish (Optional)</Label>
                      <Input
                        id="scheduled_publish"
                        type="datetime-local"
                        value={formData.scheduled_publish}
                        onChange={(e) => setFormData({ ...formData, scheduled_publish: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-sm text-slate-500 mt-1">Leave empty to publish immediately when status is set to "Published"</p>
                    </div>
                  </TabsContent>

                  <div className="flex justify-end space-x-4 p-6 border-t border-slate-200 bg-slate-50 sticky bottom-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingArticle(null);
                        resetForm();
                      }}
                      className="font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
                    >
                      {submitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingArticle ? 'Update Article' : 'Create Article'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </motion.div>
          </div>
        )}

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-600" />
                Insert Link
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-text" className="text-slate-700 font-semibold">Link Text</Label>
                  <Input
                    id="link-text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Click here"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="link-url" className="text-slate-700 font-semibold">URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowLinkDialog(false);
                      setLinkUrl("");
                      setLinkText("");
                      setSelectedLinkText("");
                      setLinkSelection(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={insertLink}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Insert Link
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
