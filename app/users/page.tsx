"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  UserPlus, 
  Trophy, 
  Star, 
  Calendar,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import UserSearch from '@/components/user-search';
import { userProfileService, UserProfile } from '@/lib/user-profile-service';
import Link from 'next/link';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // For now, we'll show a message that users need to search
    // In a real app, you might want to show recent users or featured users
    setLoading(false);
  }, []);

  const handleUserSelect = (user: UserProfile) => {
    router.push(`/user/${user.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">User Directory</h1>
              <p className="text-slate-600">Discover and connect with other users</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-emerald-500" />
              <span>Find Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <UserSearch
                placeholder="Search by name or email..."
                onUserSelect={handleUserSelect}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Search for users by their name or email address
            </p>
          </CardContent>
        </Card>

        {/* Featured Users or Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How to Find Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <span>How to Find Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-emerald-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Search by Name</p>
                    <p className="text-xs text-slate-600">Type a user's name in the search box above</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-emerald-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Search by Email</p>
                    <p className="text-xs text-slate-600">Enter part of their email address</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-emerald-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">View Profile</p>
                    <p className="text-xs text-slate-600">Click on any user to view their full profile</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Platform Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">500+</div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,200+</div>
                  <div className="text-sm text-slate-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-slate-600">Daily Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">25+</div>
                  <div className="text-sm text-slate-600">Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-emerald-500" />
                <span>Search Results for "{searchQuery}"</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Use the search box above to find users</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="py-8">
              <div className="max-w-md mx-auto">
                <Users className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Connect with the Community
                </h3>
                <p className="text-slate-600 mb-6">
                  Discover talented users, see their achievements, and learn from their success stories.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => document.querySelector('input')?.focus()}>
                    <Search className="h-4 w-4 mr-2" />
                    Start Searching
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
