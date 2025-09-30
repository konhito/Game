"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Share2, Trophy, Gift, Users, Loader2, DollarSign, Target } from "lucide-react";
import { authService } from "@/lib/auth-service";
import GoogleAuthButton from "@/components/google-auth-button";
import { robustRedirect, checkPageAfterDelay, forceRedirect, verifyAuthState } from "@/lib/redirection-utils";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
    setSuccess(""); // Clear success message when user types
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
      
      // Show success message briefly
      setSuccess("Login successful! Redirecting...");
      
      // Verify authentication state
      if (!verifyAuthState(authService)) {
        console.error("Email login success but user not authenticated");
        setError("Authentication failed. Please try again.");
        return;
      }
      
      console.log("Email authentication verified, starting robust redirect...");
      
      // Use robust redirection with multiple fallbacks
      await robustRedirect(router, {
        target: "/dashboard",
        delay: 200,
        maxAttempts: 3,
        fallbackMethods: ['router', 'location', 'replace']
      });
      
      console.log("Robust redirect completed successfully");
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    setSuccess("Google sign-in successful! Redirecting...");
    
    try {
      // Wait for auth state to be properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify authentication state
      if (!verifyAuthState(authService)) {
        console.error("Google auth success but user not authenticated");
        setError("Authentication failed. Please try again.");
        return;
      }
      
      console.log("Google authentication verified, starting robust redirect...");
      
      // Use robust redirection with multiple fallbacks
      await robustRedirect(router, {
        target: "/dashboard",
        delay: 200,
        maxAttempts: 3,
        fallbackMethods: ['router', 'location', 'replace']
      });
      
      console.log("Robust redirect completed successfully");
      
    } catch (error) {
      console.error("Robust redirect failed:", error);
      
      // Final fallback - check if still on sign-in page and force redirect
      const stillOnSignIn = await checkPageAfterDelay("/sign-in", 1000);
      if (stillOnSignIn) {
        console.log("Still on sign-in page, using force redirect...");
        forceRedirect("/dashboard");
      }
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

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

        <div className="grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Sign In Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <Card className="bg-white/80 border-slate-200/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">₽</span>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Welcome Back!
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-2">
                    Sign in to your PineCrest account and continue earning rewards
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                      className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20"
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
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                  
                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  isLoading={isGoogleLoading}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-violet-400 transition-all duration-200"
                />

                <div className="text-center">
                  <span className="text-slate-600">Don&apos;t have an account? </span>
                  <Link
                    href="/sign-up"
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
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
            className="flex flex-col justify-center space-y-6"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Share and Earn Money
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Share social media links, complete tasks, and earn real money with PineCoins!
              </p>
            </div>

            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-4 bg-white/60 border border-slate-200/50 rounded-lg shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Share Social Media Links</h3>
                  <p className="text-slate-600 text-sm">Post links on your social media and earn money</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-4 bg-white/60 border border-slate-200/50 rounded-lg shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Earn Real Money</h3>
                  <p className="text-slate-600 text-sm">Convert your points to real cash rewards</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-4 bg-white/60 border border-slate-200/50 rounded-lg shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Complete Tasks</h3>
                  <p className="text-slate-600 text-sm">Simple social media tasks for guaranteed earnings</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
