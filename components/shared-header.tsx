"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function SharedHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomeHeroVisible, setIsHomeHeroVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated using localStorage
    const checkAuth = () => {
      // Only access localStorage in the browser and ensure it's properly available
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      try {
        // Test if localStorage actually works
        if (typeof localStorage === 'undefined') {
          setLoading(false);
          return;
        }
        
        const testKey = '__test__';
        try {
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
        } catch (e) {
          // localStorage doesn't work properly
          setLoading(false);
          return;
        }
        
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

  // Handle scroll detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);

    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Homepage: transparent only while hero is visible, solid once below hero.
  useEffect(() => {
    if (!isHomePage || typeof window === "undefined") {
      setIsHomeHeroVisible(false);
      return;
    }

    const hero = document.getElementById("home-hero");
    if (!hero) {
      setIsHomeHeroVisible(window.scrollY < window.innerHeight - 120);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHomeHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHomePage, pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Hide header on dashboard pages - moved after all hooks
  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <motion.header 
      className={`z-50 w-full border-b transition-all duration-300 ${
        isHomePage
          ? isHomeHeroVisible
            ? "border-transparent bg-transparent backdrop-blur-0 shadow-none"
            : "border-slate-200/80 backdrop-blur-xl bg-white/95 shadow-lg"
          : isScrolled
            ? "border-slate-200/80 backdrop-blur-xl bg-white/95 shadow-lg"
            : "border-slate-200/50 backdrop-blur-md bg-white/70"
      } ${isHomePage ? "" : "sticky top-0"} safe-top`}
      style={
        isHomePage
          ? { position: "fixed", top: 0, left: 0, right: 0 }
          : undefined
      }
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                <img 
                  src="/Icon.png" 
                  alt="PineCrest Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                PineCrest
              </span>
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <div className="mobile-menu-container md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 touch-target no-select"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </motion.div>
            </Button>
          </div>

          {/* Desktop Auth Buttons */}
          <motion.div 
            className="hidden md:flex items-center space-x-4"
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
                  <Button variant="outline" className="border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-xl transition-all duration-200">
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
          </motion.div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className={`mobile-menu-container md:hidden border-t border-slate-200/50 overflow-hidden ${
              isScrolled ? 'bg-white/95 backdrop-blur-xl' : 'bg-white/70 backdrop-blur-md'
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto'
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 py-5 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                {["Features", "News", "Leaderboard", "About"].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0 
                    }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Link 
                      href={item === "News" ? "/news" : `/#${item.toLowerCase()}`}
                      className="block text-slate-700 hover:text-emerald-600 active:text-emerald-700 transition-colors font-medium py-3 px-4 rounded-lg hover:bg-emerald-50/50 active:bg-emerald-100/50 touch-target no-select"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <motion.div 
                className="pt-4 border-t border-slate-200/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-12 w-full rounded-xl"></div>
                ) : isAuthenticated ? (
                  <Link href="/dashboard" className="block">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-semibold py-3.5 rounded-xl shadow-lg touch-target no-select">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2.5">
                    <Link href="/sign-in" className="block">
                      <Button variant="outline" className="w-full border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 font-semibold py-3.5 rounded-xl transition-all duration-200 touch-target no-select">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="block">
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-semibold py-3.5 rounded-xl shadow-lg touch-target no-select">
                        Get Started Free
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
