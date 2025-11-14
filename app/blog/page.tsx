import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "10 Tips to Maximize Your PineCoins Earnings",
      excerpt: "Learn proven strategies to earn more rewards on PineCrest and boost your weekly leaderboard ranking.",
      author: "PineCrest Team",
      date: "2025-01-15",
      category: "Tips & Tricks",
    },
    {
      id: 2,
      title: "Understanding Task Verification: A Complete Guide",
      excerpt: "Everything you need to know about how tasks are verified and how to ensure your submissions are approved.",
      author: "PineCrest Team",
      date: "2025-01-10",
      category: "Guides",
    },
    {
      id: 3,
      title: "Weekly Leaderboard Winners Announced",
      excerpt: "Congratulations to this week's top performers! See who earned the most points and learn their strategies.",
      author: "PineCrest Team",
      date: "2025-01-08",
      category: "News",
    },
    {
      id: 4,
      title: "New Features: Enhanced Task Discovery and Rewards",
      excerpt: "We've added new features to make it easier to find tasks and earn rewards. Here's what's new!",
      author: "PineCrest Team",
      date: "2025-01-05",
      category: "Updates",
    },
    {
      id: 5,
      title: "How to Build a Winning Strategy on PineCrest",
      excerpt: "Discover the best practices for completing tasks efficiently and climbing the leaderboard.",
      author: "PineCrest Team",
      date: "2025-01-01",
      category: "Strategy",
    },
    {
      id: 6,
      title: "Community Spotlight: Top Performers Share Their Secrets",
      excerpt: "We interviewed our top users to learn their strategies and share them with the community.",
      author: "PineCrest Team",
      date: "2024-12-28",
      category: "Community",
    },
  ];

  const categories = ["All", "Tips & Tricks", "Guides", "News", "Updates", "Strategy", "Community"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            PineCrest Blog
          </h1>
          <p className="text-lg text-slate-600">
            Tips, guides, updates, and insights to help you succeed on PineCrest
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full border border-slate-300 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 group-hover:gap-2 transition-all"
                >
                  Read more
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Want to stay updated?</p>
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            View All News & Updates
          </Link>
        </div>
      </div>
    </div>
  );
}


