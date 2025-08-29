"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SharedFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard pages - moved after all hooks
  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-slate-800 text-white py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center  mb-4">
              <div className="w-20 h-20 flex items-center justify-center">
                <img 
                  src="/Logo1.png" 
                  alt="PineCoin Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold">PineCoin</span>
            </div>
            <p className="text-slate-300 mb-4">
              Earn rewards from your social media activities and convert them to real money.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/news" className="hover:text-white transition-colors">News & Updates</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2024 PineCoin. All rights reserved. Earn rewards from social media activities.</p>
        </div>
      </div>
    </footer>
  );
}
