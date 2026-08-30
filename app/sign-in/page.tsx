"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Share2, Users, Loader2, DollarSign, Target } from "lucide-react";
import { authService } from "@/lib/auth-service";
import GoogleAuthButton from "@/components/google-auth-button";
import { robustRedirect, verifyAuthState } from "@/lib/redirection-utils";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isUserSwitching, setIsUserSwitching] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing user on component mount and redirect if authenticated
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = authService.getUser();
        const token = authService.getToken();
        const isAuth = authService.isAuthenticated();
        
        console.log('Sign-in page: Auth check:', {
          hasUser: !!user,
          hasToken: !!token,
          isAuth,
          userEmail: user?.email
        });
        
        if (user && token && isAuth) {
          console.log('Sign-in page: User is authenticated, redirecting to dashboard');
          
          // Ensure cookies are properly set for the current user
          authService.refreshCookies();
          
          // Redirect to dashboard immediately
          await robustRedirect(router, {
            target: "/dashboard",
            delay: 100,
            maxAttempts: 2,
            fallbackMethods: ['router', 'location', 'replace']
          });
          
          return; // Exit early to prevent showing the sign-in form
        }
        
        // If not authenticated, show the sign-in form
        console.log('Sign-in page: User not authenticated, showing sign-in form');
        
      } catch (error) {
        console.error('Sign-in page: Auth check failed:', error);
        // Continue to show sign-in form on error
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
    setSuccess(""); // Clear success message when user types
  };

  const handleSwitchUser = () => {
    console.log("User switching - clearing current session");
    authService.logout();
    setCurrentUser(null);
    setIsUserSwitching(false);
    setError("");
    setSuccess("Previous session cleared. You can now sign in with a different account.");
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setIsUserSwitching(false); // Clear user switching state
      setCurrentUser(null);
      
      console.log("Attempting login with:", { email: formData.email });
      
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", result);
      console.log("User authenticated:", authService.isAuthenticated());
      console.log("User data:", authService.getUser());
      console.log("Token:", authService.getToken());
      
      // Refresh auth state from localStorage to ensure it's up to date
      authService.refreshAuthState();
      console.log("After refresh - User authenticated:", authService.isAuthenticated());
      console.log("After refresh - User data:", authService.getUser());
      console.log("After refresh - Token:", authService.getToken());
      
      // Manual localStorage check
      console.log("Manual localStorage check:");
      console.log("  auth_token:", localStorage.getItem('auth_token'));
      console.log("  auth_user:", localStorage.getItem('auth_user'));
      
      // Verify authentication state
      if (!verifyAuthState(authService)) {
        console.error("Email login success but user not authenticated");
        setError("Authentication failed. Please try again.");
        return;
      }
      
      // Ensure cookies are properly set before redirecting
      console.log("Refreshing cookies before redirect...");
      authService.refreshCookies();
      
      // Wait for cookies to be set and processed by the browser
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify cookies are set
      const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_auth_token='));
      const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_user_data='));
      console.log("Cookie verification before redirect:", {
        tokenCookieSet: !!tokenCookie,
        userCookieSet: !!userCookie
      });
      
      // Show success message briefly
      setSuccess("Login successful! Redirecting...");
      
      console.log("Email authentication verified, starting robust redirect...");
      
      // Use robust redirection with multiple fallbacks
      // Use replace first for most reliable redirect
      await robustRedirect(router, {
        target: "/dashboard",
        delay: 200,
        maxAttempts: 2,
        fallbackMethods: ['replace', 'location', 'router']
      });
      
      // If we're still here after redirect, force it
      await new Promise(resolve => setTimeout(resolve, 500));
      if (typeof window !== 'undefined' && window.location.pathname === '/sign-in') {
        console.warn('Still on sign-in page after redirect, forcing navigation...');
        window.location.replace('/dashboard');
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    setSuccess("Google sign-in successful! Redirecting...");
    setIsUserSwitching(false); // Clear user switching state
    setCurrentUser(null);
    
    try {
      // Wait for auth state to be properly set
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify authentication state
      if (!verifyAuthState(authService)) {
        console.error("Google auth success but user not authenticated");
        setError("Authentication failed. Please try again.");
        return;
      }
      
      // Ensure cookies are properly set before redirecting
      console.log("Refreshing cookies before redirect...");
      authService.refreshCookies();
      
      // Wait for cookies to be set and processed by the browser
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify cookies are set
      const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_auth_token='));
      const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_user_data='));
      console.log("Cookie verification before redirect:", {
        tokenCookieSet: !!tokenCookie,
        userCookieSet: !!userCookie
      });
      
      console.log("Google authentication verified, starting robust redirect...");
      
      // Use robust redirection with multiple fallbacks
      // Use replace first for most reliable redirect
      await robustRedirect(router, {
        target: "/dashboard",
        delay: 200,
        maxAttempts: 2,
        fallbackMethods: ['replace', 'location', 'router']
      });
      
      // If we're still here after redirect, force it
      await new Promise(resolve => setTimeout(resolve, 500));
      if (typeof window !== 'undefined' && window.location.pathname === '/sign-in') {
        console.warn('Still on sign-in page after redirect, forcing navigation...');
        window.location.replace('/dashboard');
      }
      
    } catch (error) {
      console.error("Robust redirect failed:", error);
      
      // Final fallback - force redirect immediately
      console.log("Using force redirect as fallback...");
      window.location.replace('/dashboard');
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--ink)]/15 border-t-[var(--pine)]"></div>
          <p className="text-sm text-[var(--ink-muted)]">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1440px] flex-col items-center justify-center px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-16">
        <Link
          href="/"
          className="absolute left-4 top-24 inline-flex items-center rounded-full border border-[var(--ink)]/12 px-4 py-2 text-sm text-[var(--ink-muted)] transition-colors hover:border-[var(--pine)]/40 hover:text-[var(--pine)] sm:left-6 sm:top-28 lg:left-16"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid w-full max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          {/* Main Sign In Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center lg:pt-10"
          >
            <Card className="rounded-[1.75rem] border-[var(--ink)]/12 bg-[var(--paper)] py-7 shadow-[0_24px_80px_rgba(20,48,35,0.12)] sm:py-9">
              <CardHeader className="space-y-4 px-6 sm:px-9">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <img 
                    src="/Icon.png" 
                    alt="Pinecrest logo"
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div>
                  <CardTitle className="text-3xl font-semibold tracking-[-.045em] text-[var(--ink)]">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-md text-base leading-6 text-[var(--ink-muted)]">
                    Pick up where you left off and keep your progress moving.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6 sm:px-9">
                {/* User Switching Alert */}
                {isUserSwitching && currentUser && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Users className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            Currently signed in as {currentUser.name || currentUser.email}
                          </p>
                          <p className="text-xs leading-5 text-amber-600">
                            To sign in with a different account, please sign out first
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleSwitchUser}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        Switch User
                      </Button>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      autoComplete="email"
                      className="h-12 rounded-xl border-[var(--ink)]/15 bg-[var(--paper-deep)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 focus:border-[var(--pine)] focus:ring-[var(--pine)]/20 disabled:opacity-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="h-12 rounded-xl border-[var(--ink)]/15 bg-[var(--paper-deep)] pr-10 text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 focus:border-[var(--pine)] focus:ring-[var(--pine)]/20 disabled:opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] transition-colors hover:text-[var(--pine)]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                     <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  {success && (
                     <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                      {success}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold text-[var(--pine)] transition-colors hover:text-[var(--forest)]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="pine-button pine-button-dark h-12 w-full rounded-full font-semibold disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[var(--ink)]/12" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--paper)] px-2 text-xs text-[var(--ink-muted)]">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    isLoading={isGoogleLoading}
                    className="h-12 w-full rounded-full border-[var(--ink)]/15 text-[var(--ink)] transition-colors hover:border-[var(--pine)]/50 hover:bg-[var(--paper-deep)]"
                  />
                </div>

                <div className="text-center">
                  <span className="text-[var(--ink-muted)]">Don&apos;t have an account? </span>
                  <Link
                    href="/sign-up"
                    className="font-semibold text-[var(--pine)] transition-colors hover:text-[var(--forest)]"
                  >
                    Sign up now
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-8 lg:pt-10"
          >
            <div className="text-center lg:text-left">
              <p className="eyebrow text-[var(--pine)]">Your progress is waiting</p>
              <h2 className="display-heading mt-5 max-w-xl text-5xl leading-[.94] tracking-[-.065em] sm:text-7xl">
                Keep your momentum.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--ink-muted)]">
                Pick up a verified task, see your points add up, and stay in the rhythm.
              </p>
            </div>

            <div className="space-y-3">
              <motion.div
                className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--ink)]/10 bg-[var(--paper-deep)] p-4 transition-colors hover:border-[var(--pine)]/30 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-.02em] text-[var(--ink)]">Share Social Media Links</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Post links on your social media and earn money.</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--ink)]/10 bg-[var(--paper-deep)] p-4 transition-colors hover:border-[var(--pine)]/30 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-.02em] text-[var(--ink)]">Earn Real Money</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Convert your points to real cash rewards.</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--ink)]/10 bg-[var(--paper-deep)] p-4 transition-colors hover:border-[var(--pine)]/30 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-.02em] text-[var(--ink)]">Complete Tasks</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Simple social media tasks for clear progress.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
