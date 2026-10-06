"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  LayoutDashboard,
  Users, 
  ClipboardList, 
  Activity, 
  DollarSign, 
  Clock, 
  Eye,
  Plus,
  Newspaper,
  Settings,
  Bot,
  AlertTriangle,
  Shield,
  BarChart3,
  TrendingUp,
  ImageIcon,
  Menu,
  X,
  TestTube,
  Lock
} from 'lucide-react';

const moderatorAllowedHrefs = new Set([
  '/admin',
  '/admin/news',
  '/admin/create-task',
  '/admin/pending-proofs',
  '/admin/test-page',
]);

const adminPages = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Referrals', href: '/admin/referrals', icon: Users },
  { name: 'Tasks', href: '/admin/tasks', icon: ClipboardList },
  { name: 'Create Task', href: '/admin/create-task', icon: Plus },
  { name: 'Pending Proofs', href: '/admin/pending-proofs', icon: Eye },
  { name: 'Activities', href: '/admin/activities', icon: Activity },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: DollarSign },
  { name: 'News', href: '/admin/news', icon: Newspaper },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Point System', href: '/admin/point-system', icon: TrendingUp },
  { name: 'Prize Pools', href: '/admin/prize-pools', icon: BarChart3 },
  { name: 'AI Verification', href: '/admin/ai-verification', icon: Bot },
  { name: 'Duplicate Images', href: '/admin/duplicate-images', icon: ImageIcon },
  { name: 'Audit Log', href: '/admin/audit-log', icon: Shield },
  { name: 'Test Page', href: '/admin/test-page', icon: TestTube },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isModerator = user?.role === 'moderator';
  const isPageAllowedForCurrentUser = (href: string) => !isModerator || moderatorAllowedHrefs.has(href);
  const currentPageAllowed = isPageAllowedForCurrentUser(pathname || '/admin');

  useEffect(() => {
    console.log('🔍 Admin layout: Checking authentication...');
    const currentUser = authService.getUser();
    console.log('👤 Current user:', currentUser);
    
    if (!currentUser) {
      console.log('❌ No user found, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      console.log('❌ User is not admin/moderator, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    if (currentUser.role === 'moderator' && !moderatorAllowedHrefs.has(pathname || '/admin')) {
      router.push('/admin');
      return;
    }
    
    console.log('✅ User is admin, setting user state');
    setUser(currentUser);
    setLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    authService.logout();
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged'));
    }
    
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

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--paper-deep)] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--paper)] border-r border-[var(--ink)]/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {adminPages.map((page) => {
                const Icon = page.icon;
                const isActive = pathname === page.href || (page.href !== '/admin' && pathname?.startsWith(page.href));
                const isAllowed = isPageAllowedForCurrentUser(page.href);
                return (
                  <Link
                    key={page.href}
                    href={isAllowed ? page.href : '#'}
                    onClick={(event) => {
                      if (!isAllowed) {
                        event.preventDefault();
                        return;
                      }
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'
                        : isAllowed
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        : 'text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                    aria-disabled={!isAllowed}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{page.name}</span>
                    {!isAllowed && <Lock className="h-3.5 w-3.5 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{isModerator ? 'Moderator' : 'Administrator'}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-[var(--paper)]/90 shadow-sm border-b border-[var(--ink)]/10 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentPageAllowed
                    ? adminPages.find(p => pathname === p.href || (p.href !== '/admin' && pathname?.startsWith(p.href)))?.name || 'Admin Panel'
                    : 'Locked Section'}
                </h1>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                  {user.name}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
