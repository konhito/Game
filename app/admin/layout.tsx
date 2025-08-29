"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ClipboardList, 
  Image, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  LogOut,
  Plus,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Admin layout: Checking authentication...');
    const currentUser = authService.getUser();
    console.log('👤 Current user:', currentUser);
    
    if (!currentUser) {
      console.log('❌ No user found, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    if (currentUser.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    console.log('✅ User is admin, setting user state');
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const adminNavItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      description: 'Overview and statistics'
    },
    {
      title: 'Create Task',
      href: '/admin/create-task',
      icon: Plus,
      description: 'Create new social media tasks'
    },
    {
      title: 'All Tasks',
      href: '/admin/tasks',
      icon: ClipboardList,
      description: 'Manage existing tasks'
    },
    {
      title: 'Pending Proofs',
      href: '/admin/pending-proofs',
      icon: Image,
      description: 'Review and approve task proofs'
    },
    {
      title: 'All Users',
      href: '/admin/users',
      icon: Users,
      description: 'View and manage users'
    },
    {
      title: 'User Activities',
      href: '/admin/activities',
      icon: Eye,
      description: 'Monitor user activities'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                {user.name}
              </span>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Icon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {children}
        </div>
      </div>
    </div>
  );
}
