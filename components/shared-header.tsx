"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SharedHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated using localStorage
    const checkAuth = () => {
      try {
        // Check for auth token and user data in localStorage
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        
        setIsAuthenticated(!!(token && userStr));
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when localStorage is modified from the same tab
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Hide header on dashboard pages - moved after all hooks
  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <motion.header 
      className="relative z-10 border-b border-slate-200/50 backdrop-blur-md bg-white/70 sticky top-0"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-15 h-15 flex items-center justify-center">
              
                {/* Fallback text if image fails to load */}
                {/* <span className="absolute text-2xl font-bold text-emerald-600 opacity-0">₽</span> */}
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                PineCrest
              </span>
            </motion.div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "News", "Leaderboard", "About"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={item === "News" ? "/news" : `/#${item.toLowerCase()}`}
                  className="text-slate-600 hover:text-emerald-600 transition-colors font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-xl"></div>
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/sign-in">
                  <Button variant="outline" className="border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Show Get Started button for authenticated users that redirects to dashboard */}
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
