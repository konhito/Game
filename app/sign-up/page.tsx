"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Share2, Trophy, Gift, Users, CheckCircle, Star, Zap, Loader2, DollarSign, Target } from "lucide-react";
import { authService } from "@/lib/auth-service";
import GoogleAuthButton from "@/components/google-auth-button";
import { robustRedirect, verifyAuthState } from "@/lib/redirection-utils";

export default function SignUpPage() {
  const router = useRouter();
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
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing user on component mount and redirect if authenticated
  useEffect(() => {
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
      });

      console.log("Registration successful:", result);
      
      // Verify authentication state
      if (!verifyAuthState(authService)) {
        console.error("Registration success but user not authenticated");
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
      
      setSuccess("Account created successfully! Redirecting to dashboard...");
      
      // Use robust redirection with multiple fallbacks
      await robustRedirect(router, {
        target: "/dashboard",
        delay: 100,
        maxAttempts: 3,
        fallbackMethods: ['router', 'location', 'replace']
      });
      
      console.log("Robust redirect completed successfully");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-10 text-emerald-400/20"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Trophy size={60} />
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-20 text-blue-400/20"
        animate={{ rotate: -360, scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Gift size={50} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-40 left-20 text-emerald-400/20"
        animate={{ rotate: 360, scale: [1, 1.3, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <Users size={70} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-10 text-blue-400/20"
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <Trophy size={55} />
      </motion.div>

      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center py-12">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-16 h-16 flex items-center justify-center mb-6">
                <img 
                  src="/Icon.png" 
                  alt="PineCrest Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Share and Earn Money
              </h1>
              <p className="text-slate-600 text-lg">
                Create your account and start sharing social media links to earn real money!
              </p>
            </div>

            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-6 bg-white/60 border border-slate-200/50 rounded-xl shadow-lg"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mr-5 shadow-lg">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Share Social Media</h3>
                  <p className="text-slate-600">Post links on your social platforms and earn money</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-6 bg-white/60 border border-slate-200/50 rounded-xl shadow-lg"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-5 shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Real Money Rewards</h3>
                  <p className="text-slate-600">Convert your earnings to real cash</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-6 bg-white/60 border border-slate-200/50 rounded-xl shadow-lg"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mr-5 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Simple Tasks</h3>
                  <p className="text-slate-600">Easy social media tasks for guaranteed earnings</p>
                </div>
              </motion.div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-emerald-600">$20</div>
                <div className="text-sm text-emerald-600">Signup Bonus</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-violet-600">$5</div>
                <div className="text-sm text-violet-600">Per Share</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-amber-600">$10</div>
                <div className="text-sm text-amber-600">Daily Tasks</div>
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
            <Card className="bg-white/80 border-slate-200/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-2">
                    Join thousands of users and start earning money today
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-700 font-medium">
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
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 disabled:opacity-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-700 font-medium">
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
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
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
                      className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
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
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 pr-10 disabled:opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
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
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 pr-10 disabled:opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                  </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm text-slate-600">
                      I agree to the{" "}
                      <Link href="/terms" className="text-violet-600 hover:text-violet-700">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-violet-600 hover:text-violet-700">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    isLoading={isGoogleLoading}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-400 transition-all duration-200"
                  />
                </div>

                <div className="text-center">
                  <span className="text-slate-600">Already have an account? </span>
                  <Link
                    href="/sign-in"
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 p-6 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-xl text-center"
            >
              <div className="text-2xl font-bold text-emerald-800 mb-2">💰 Welcome Bonus!</div>
              <p className="text-emerald-700">
                Get <span className="font-semibold">$20</span> instantly when you create your account
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
