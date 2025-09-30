"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth-service';
import GoogleAuthButton from '@/components/google-auth-button';
import { CheckCircle, XCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

export default function TestRedirectionPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (name: string, status: TestResult['status'], message: string) => {
    setTestResults(prev => [...prev, {
      name,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const runAuthStateTests = () => {
    addTestResult('Auth State Check', 'running', 'Checking authentication state...');
    
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();
    const token = authService.getToken();
    
    if (isAuthenticated && user && token) {
      addTestResult('Auth State Check', 'success', `User authenticated: ${user.email}`);
    } else {
      addTestResult('Auth State Check', 'error', 'User not authenticated');
    }
  };

  const runCookieTests = () => {
    addTestResult('Cookie Check', 'running', 'Checking authentication cookies...');
    
    const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_auth_token='));
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_user_data='));
    
    if (tokenCookie && userCookie) {
      addTestResult('Cookie Check', 'success', 'Authentication cookies found');
    } else {
      addTestResult('Cookie Check', 'error', 'Authentication cookies missing');
    }
  };

  const runLocalStorageTests = () => {
    addTestResult('LocalStorage Check', 'running', 'Checking localStorage...');
    
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    if (token && user) {
      addTestResult('LocalStorage Check', 'success', 'LocalStorage data found');
    } else {
      addTestResult('LocalStorage Check', 'error', 'LocalStorage data missing');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addTestResult('Test Suite', 'running', 'Starting comprehensive authentication tests...');
    
    // Run tests with delays
    runAuthStateTests();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    runCookieTests();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    runLocalStorageTests();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addTestResult('Test Suite', 'success', 'All tests completed');
    setIsRunning(false);
  };

  const handleGoogleSuccess = async () => {
    setIsGoogleLoading(true);
    addTestResult('Google Auth', 'running', 'Processing Google authentication...');
    
    try {
      // Wait for auth to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run tests
      runAuthStateTests();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      runCookieTests();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      runLocalStorageTests();
      
      addTestResult('Google Auth', 'success', 'Google authentication completed successfully');
      
      // Test redirection
      addTestResult('Redirection Test', 'running', 'Testing redirection to dashboard...');
      
      setTimeout(() => {
        router.push('/dashboard');
        addTestResult('Redirection Test', 'success', 'Redirection initiated');
      }, 1000);
      
    } catch (error) {
      addTestResult('Google Auth', 'error', `Google authentication failed: ${error}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    addTestResult('Google Auth', 'error', `Google authentication error: ${error}`);
  };

  const clearAuth = () => {
    authService.logout();
    setTestResults([]);
    addTestResult('Auth Clear', 'success', 'Authentication cleared');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'running':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Redirection Test Suite
            </h1>
            <p className="text-slate-600 mt-2">
              Test Google sign-in redirection and authentication state
            </p>
          </div>
          <Link href="/sign-in">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>

        {/* Test Controls */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
              
              <Button 
                onClick={clearAuth} 
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Clear Auth
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Google Authentication Test</h3>
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                isLoading={isGoogleLoading}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No tests run yet. Click "Run All Tests" to start.
              </p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.name}</h4>
                          <p className="text-sm opacity-80">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <p className="text-xs opacity-60 mt-1">
                          {result.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Auth State */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">AuthService State</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Authenticated:</span>
                    <Badge variant={authService.isAuthenticated() ? "default" : "secondary"}>
                      {authService.isAuthenticated() ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Has User:</span>
                    <Badge variant={authService.getUser() ? "default" : "secondary"}>
                      {authService.getUser() ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Has Token:</span>
                    <Badge variant={authService.getToken() ? "default" : "secondary"}>
                      {authService.getToken() ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">User Details</h4>
                <div className="text-sm space-y-1">
                  {authService.getUser() ? (
                    <>
                      <p><strong>Name:</strong> {authService.getUser()?.name}</p>
                      <p><strong>Email:</strong> {authService.getUser()?.email}</p>
                      <p><strong>Role:</strong> {authService.getUser()?.role}</p>
                    </>
                  ) : (
                    <p className="text-slate-500">No user data</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
