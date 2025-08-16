"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Gamepad2, Trophy, Gift, Users, CheckCircle, Star, Zap } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({ provider: "google" });
    } catch (error) {
      console.error("Google sign-up failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-10 text-amber-400/20"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Gamepad2 size={60} />
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-20 text-emerald-400/20"
        animate={{ rotate: -360, scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Trophy size={50} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-40 left-20 text-violet-400/20"
        animate={{ rotate: 360, scale: [1, 1.3, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <Gift size={70} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-10 text-blue-400/20"
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <Users size={55} />
      </motion.div>

      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center py-12">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center text-slate-600 hover:text-slate-800 transition-colors"
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
              <div className="mx-auto lg:mx-0 w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Gamepad2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Join the Casino Revolution
              </h1>
              <p className="text-slate-600 text-lg">
                Create your account and start earning points, spinning wheels, and climbing the leaderboard!
              </p>
            </div>

            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-6 bg-white/60 border border-slate-200/50 rounded-xl shadow-lg"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mr-5 shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Instant Rewards</h3>
                  <p className="text-slate-600">Get 20 points just for signing up!</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-6 bg-white/60 border border-slate-200/50 rounded-xl shadow-lg"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-5 shadow-lg">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Daily Bonuses</h3>
                  <p className="text-slate-600">Free spins and login rewards every day</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-6 bg-white/60 border border-slate-200/50 rounded-xl shadow-lg"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mr-5 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Fast Growth</h3>
                  <p className="text-slate-600">Earn points through referrals and activities</p>
                </div>
              </motion.div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-emerald-600">20</div>
                <div className="text-sm text-emerald-600">Signup Points</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-violet-600">10</div>
                <div className="text-sm text-violet-600">Referral Points</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-amber-600">5</div>
                <div className="text-sm text-amber-600">Daily Login</div>
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
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-2">
                    Join thousands of players and start winning today
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-700 font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-700 font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 pr-10"
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
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 pr-10"
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
                      className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
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

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Create Account
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

                <Button
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-400 transition-all duration-200"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isLoading ? "Signing up..." : "Sign up with Google"}
                </Button>

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
              className="mt-6 p-6 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-xl text-center"
            >
              <div className="text-2xl font-bold text-amber-800 mb-2">🎉 Welcome Bonus!</div>
              <p className="text-amber-700">
                Get <span className="font-semibold">20 points</span> instantly when you create your account
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
