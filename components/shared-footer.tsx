"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SharedFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard pages and homepage (homepage uses cinematic footer)
  if (pathname && (pathname.startsWith('/dashboard') || pathname === '/')) {
    return null;
  }

  return (
    <footer className="bg-slate-800 text-white py-8 sm:py-10 md:py-14 px-4 relative z-10 safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 md:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
                <img 
                  src="/Icon.png" 
                  alt="PineCrest Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-bold ml-2">PineCrest</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
              Earn rewards from your social media activities and convert them to real money.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2.5 sm:mb-3">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs sm:text-sm">
              <li><Link href="/dashboard" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Dashboard</Link></li>
              <li><Link href="/leaderboard" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Leaderboard</Link></li>
              <li><Link href="/about" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">About</Link></li>
              <li><Link href="/contact" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2.5 sm:mb-3">Support</h3>
            <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs sm:text-sm">
              <li><Link href="/help" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Help Center</Link></li>
              <li><Link href="/terms" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Terms of Service</Link></li>
              <li><Link href="/privacy" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Privacy Policy</Link></li>
              <li><Link href="/faq" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2.5 sm:mb-3">Connect</h3>
            <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs sm:text-sm">
              <li><Link href="/news" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">News & Updates</Link></li>
              <li><Link href="/blog" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Blog</Link></li>
              <li><Link href="/community" className="inline-block py-1 hover:text-white active:text-slate-100 transition-colors touch-target">Community</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-6 sm:mt-8 md:mt-10 pt-5 sm:pt-6 md:pt-8 text-center text-slate-400 text-xs sm:text-sm">
          <p className="leading-relaxed">&copy; 2025 PineCrest. All rights reserved. Earn rewards from social media activities.</p>
        </div>
      </div>
    </footer>
  );
}
