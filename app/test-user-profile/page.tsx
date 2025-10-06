"use client";

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TestUserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      try {
        const isAuth = authService.isAuthenticated();
        const currentUser = authService.getUser();
        
        console.log('Auth check:', { isAuth, currentUser });
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 p-8">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>User Profile Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">User Data Found:</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Profile Links:</h3>
                  <div className="space-x-4">
                    <Link href="/user">
                      <Button variant="outline">Go to /user (redirect)</Button>
                    </Link>
                    <Link href={`/user/${user.id}`}>
                      <Button>Go to /user/{user.id}</Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No user data found. Please sign in first.</p>
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
