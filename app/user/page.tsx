"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';

export default function UserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToProfile = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          console.log('User not authenticated, redirecting to sign-in');
          router.push('/sign-in');
          return;
        }

        // Get current user
        const user = authService.getUser();
        if (user && user.id) {
          console.log('Redirecting to user profile:', user.id);
          router.push(`/user/${user.id}`);
        } else {
          console.log('No user ID found, redirecting to sign-in');
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error redirecting to profile:', error);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    // Add a small delay to ensure auth service is ready
    const timeoutId = setTimeout(redirectToProfile, 100);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Error</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
}
