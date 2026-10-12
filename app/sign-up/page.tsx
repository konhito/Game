"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Share2, Loader2, Target, UserPlus } from "lucide-react";
import { authService } from "@/lib/auth-service";
import GoogleAuthButton from "@/components/google-auth-button";
import { robustRedirect, verifyAuthState } from "@/lib/redirection-utils";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const authCheckStarted = useRef(false);

  // Check for existing user on component mount and redirect if authenticated
  useEffect(() => {
    if (authCheckStarted.current) return;
    authCheckStarted.current = true;

    const checkAuthAndRedirect = async () => {
      try {
        const user = authService.getUser();
        const token = authService.getToken();
        const isAuth = authService.isAuthenticated();
        
        console.log('Sign-up page: Auth check:', {
          hasUser: !!user,
          hasToken: !!token,
          isAuth,
          userEmail: user?.email
        });
        
        if (user && token && isAuth) {
          console.log('Sign-up page: User is authenticated, redirecting to dashboard');
          
          // Ensure cookies are properly set for the current user
          authService.refreshCookies();
          
          // Redirect to dashboard immediately
          await robustRedirect(router, {
            target: "/dashboard",
            delay: 100,
            maxAttempts: 2,
            fallbackMethods: ['router', 'location', 'replace']
          });
          
          return; // Exit early to prevent showing the sign-up form
        }
        
        // If not authenticated, show the sign-up form
        console.log('Sign-up page: User not authenticated, showing sign-up form');
        
      } catch (error) {
        console.error('Sign-up page: Auth check failed:', error);
        // Continue to show sign-up form on error
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [router]);

  useEffect(() => {
    const referralFromUrl = searchParams.get("ref")?.trim();
    if (!referralFromUrl) return;

    setFormData((prev) => (
      prev.referralCode.trim()
        ? prev
        : { ...prev, referralCode: referralFromUrl }
    ));
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      const result = await authService.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        referral_code: formData.referralCode.trim() || undefined,
      });

      console.log("Registration successful:", result);

      if (result.referral?.applied) {
        sessionStorage.setItem("pinecoin_pending_referral_signup_reward", JSON.stringify({
          signupPoints: result.referral.signup_points,
          referralPoints: result.referral.referral_points,
        }));
      }
      
      setSuccess("Account created. Check your email to verify it before signing in.");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    setSuccess("Google sign-up successful! Redirecting to dashboard...");
    
    try {
      // Wait for auth state to be properly set
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify authentication state
      if (!verifyAuthState(authService)) {
        console.error("Google sign-up success but user not authenticated");
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
      
      // Use robust redirection with multiple fallbacks
      await robustRedirect(router, {
        target: "/dashboard",
        delay: 100,
        maxAttempts: 3,
        fallbackMethods: ['router', 'location', 'replace']
      });
      
      console.log("Robust redirect completed successfully");
    } catch (error) {
      console.error("Robust redirect failed:", error);
      // Fallback to simple redirect
      router.push("/dashboard");
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

        <div className="grid w-full max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8 lg:pt-10"
          >
            <div className="text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-16 h-16 flex items-center justify-center mb-6">
                <img 
                  src="/Icon.png" 
                  alt="PineCrest Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="eyebrow text-[var(--pine)]">Start with one useful move</p>
              <h1 className="display-heading mt-5 max-w-xl text-5xl leading-[.94] tracking-[-.065em] sm:text-7xl">
                Make the first move count.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--ink-muted)]">
                Create your account, choose a task, and turn the consistency you already have into visible progress.
              </p>
            </div>

            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--ink)]/10 bg-[var(--paper-deep)] p-4 transition-colors hover:border-[var(--pine)]/30 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-.02em] text-[var(--ink)]">Share News Posts</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Share approved news posts and earn points for each one.</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--ink)]/10 bg-[var(--paper-deep)] p-4 transition-colors hover:border-[var(--pine)]/30 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-.02em] text-[var(--ink)]">Invite Friends</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Use a referral code during signup so successful invites award points.</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--ink)]/10 bg-[var(--paper-deep)] p-4 transition-colors hover:border-[var(--pine)]/30 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-.02em] text-[var(--ink)]">Simple Point Tasks</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Start with signup points, then keep earning through shares and referrals.</p>
                </div>
              </motion.div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 border-t border-[var(--ink)]/15 pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl font-semibold tracking-[-.05em] text-[var(--pine)]">50</div>
                <div className="mt-1 text-xs text-[var(--ink-muted)]">Signup points</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl font-semibold tracking-[-.05em] text-[var(--ink)]">10</div>
                <div className="mt-1 text-xs text-[var(--ink-muted)]">Share points</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl font-semibold tracking-[-.05em] text-[var(--ink)]">30</div>
                <div className="mt-1 text-xs text-[var(--ink-muted)]">Referral points</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <Card className="rounded-[1.75rem] border-[var(--ink)]/12 bg-[var(--paper)] py-7 shadow-[0_24px_80px_rgba(20,48,35,0.12)] sm:py-9">
              <CardHeader className="space-y-4 px-6 sm:px-9">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--forest)] text-[var(--lime)]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-semibold tracking-[-.045em] text-[var(--ink)]">
                    Create your account
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-md text-base leading-6 text-[var(--ink-muted)]">
                    A few details, then you are ready to start earning.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6 sm:px-9">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-[var(--ink)]">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        autoComplete="given-name"
                        className="h-12 rounded-xl border-[var(--ink)]/15 bg-[var(--paper-deep)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 focus:border-[var(--pine)] focus:ring-[var(--pine)]/20 disabled:opacity-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-[var(--ink)]">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        autoComplete="family-name"
                        className="h-12 rounded-xl border-[var(--ink)]/15 bg-[var(--paper-deep)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 focus:border-[var(--pine)] focus:ring-[var(--pine)]/20 disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="referralCode" className="text-sm font-medium text-[var(--ink)]">
                      Referral Code <span className="text-[var(--ink-muted)]">(Optional)</span>
                    </Label>
                    <Input
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      placeholder="Enter a referral code"
                      value={formData.referralCode}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      autoComplete="off"
                      className="h-12 rounded-xl border-[var(--ink)]/15 bg-[var(--paper-deep)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 focus:border-[var(--pine)] focus:ring-[var(--pine)]/20 disabled:opacity-50"
                    />
                    <p className="text-xs leading-5 text-[var(--ink-muted)]">
                      If someone invited you, paste their code here before creating your account.
                    </p>
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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        autoComplete="new-password"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--ink)]">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        autoComplete="new-password"
                        className="h-12 rounded-xl border-[var(--ink)]/15 bg-[var(--paper-deep)] pr-10 text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 focus:border-[var(--pine)] focus:ring-[var(--pine)]/20 disabled:opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] transition-colors hover:text-[var(--pine)]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                  </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      disabled={isLoading}
                      className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-[var(--ink)]/25 text-[var(--pine)] focus:ring-[var(--pine)] disabled:opacity-50"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm leading-6 text-[var(--ink-muted)]">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[var(--pine)] underline-offset-4 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[var(--pine)] underline-offset-4 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {error && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                      {error.includes("This device already has a Pinecrest account") && (
                        <p className="mt-2">
                          Already registered? <Link href="/sign-in" className="font-semibold underline underline-offset-4">Sign in to your account</Link>.
                        </p>
                      )}
                    </div>
                  )}

                  {success && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="pine-button pine-button-dark h-12 w-full rounded-full font-semibold disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
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
                    referralCode={formData.referralCode.trim() || searchParams.get("ref")?.trim() || undefined}
                    isLoading={isGoogleLoading}
                    className="h-12 w-full rounded-full border-[var(--ink)]/15 text-[var(--ink)] transition-colors hover:border-[var(--pine)]/50 hover:bg-[var(--paper-deep)]"
                  />
                </div>

                <div className="text-center">
                  <span className="text-[var(--ink-muted)]">Already have an account? </span>
                  <Link
                    href="/sign-in"
                    className="font-semibold text-[var(--pine)] transition-colors hover:text-[var(--forest)]"
                  >
                    Sign in here
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 flex items-center justify-between gap-4 rounded-[1.25rem] border border-[var(--pine)]/20 bg-[var(--paper-deep)] px-5 py-4"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--ink)]">Welcome points</div>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">Added as soon as your account is created.</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-2xl font-semibold tracking-[-.05em] text-[var(--pine)]">+50</div>
                <div className="text-xs text-[var(--ink-muted)]">points</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--pine)]" />
          <p className="text-sm text-[var(--ink-muted)]">Loading signup...</p>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
