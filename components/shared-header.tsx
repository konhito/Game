"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MoveUpRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const navigation = [
  { label: "How it works", href: "/#features" },
  { label: "Leaderboard", href: "/#leaderboard" },
  { label: "News", href: "/news" },
  { label: "About", href: "/#about" },
];

export default function SharedHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(isHomePage);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        setIsAuthenticated(Boolean(localStorage.getItem("auth_token") && localStorage.getItem("auth_user")));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authStateChanged", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authStateChanged", checkAuth);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (!isHomePage) {
      setHeroVisible(false);
      return;
    }

    const hero = document.getElementById("home-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHomePage, pathname]);

  if (pathname?.startsWith("/dashboard")) return null;

  const onHero = isHomePage && heroVisible && !isScrolled;
  const navClass = onHero ? "text-[var(--paper)]" : "text-[var(--ink)]";

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 safe-top transition-colors duration-300 ${onHero ? "bg-transparent" : "border-b border-[var(--ink)]/10 bg-[var(--paper)]/95 backdrop-blur-md"}`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/" className={`flex items-center gap-3 ${navClass}`} aria-label="Pinecrest home">
          <img src="/Icon.png" alt="" className="h-9 w-7 object-contain" />
          <span className={`text-lg font-semibold tracking-[-.04em] ${onHero ? "text-[var(--paper)]" : "text-[var(--ink)]"}`}>Pinecrest.</span>
        </Link>

        <nav className={`hidden items-center gap-8 text-sm font-medium md:flex ${navClass}`} aria-label="Main navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="opacity-70 hover:opacity-100">{item.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? <span className={`h-10 w-24 animate-pulse rounded-full ${onHero ? "bg-[var(--paper)]/15" : "bg-[var(--ink)]/10"}`} /> : isAuthenticated ? <Link href="/dashboard" className="pine-button pine-button-lime">Dashboard <MoveUpRight size={16} /></Link> : <><Link href="/sign-in" className={`rounded-full px-4 py-3 text-sm font-semibold ${onHero ? "!text-white" : "!text-[var(--ink)]"}`}>Sign in</Link><Link href="/sign-up" className="pine-button pine-button-lime">Get started <MoveUpRight size={16} /></Link></>}
        </div>

        <button type="button" className={`flex h-11 w-11 items-center justify-center rounded-full border md:hidden ${onHero ? "border-[var(--paper)]/25 text-[var(--paper)]" : "border-[var(--ink)]/15 text-[var(--ink)]"}`} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>

      {menuOpen && <div className="border-t border-[var(--ink)]/10 bg-[var(--paper)] px-6 py-5 text-[var(--ink)] shadow-xl md:hidden"><nav className="grid gap-1" aria-label="Mobile navigation">{navigation.map((item) => <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 text-base font-medium hover:bg-[var(--paper-deep)]" onClick={() => setMenuOpen(false)}>{item.label}</Link>)}</nav><div className="mt-4 grid gap-2 border-t border-[var(--ink)]/10 pt-4">{isAuthenticated ? <Link href="/dashboard" className="pine-button pine-button-dark">Go to dashboard</Link> : <><Link href="/sign-in" className="pine-button pine-button-outline">Sign in</Link><Link href="/sign-up" className="pine-button pine-button-dark">Get started <MoveUpRight size={16} /></Link></>}</div></div>}
    </motion.header>
  );
}
