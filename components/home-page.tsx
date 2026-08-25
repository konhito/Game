"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleCheck,
  Clock3,
  Coins,
  Eye,
  Gift,
  MoveUpRight,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StructuredData, organizationSchema, websiteSchema, webApplicationSchema } from "@/components/structured-data";
import { resolveNewsImageUrl } from "@/lib/news-image";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  tags: string[];
  featured_image?: string;
  category?: string;
}

interface TaskPointRules {
  signup_points: number;
  referral_points: number;
  share_social_points: number;
  share_news_points: number;
  comment_points: number;
  like_points: number;
  daily_login_points: number;
}

const defaultTaskPointRules: TaskPointRules = {
  signup_points: 50,
  referral_points: 30,
  share_social_points: 20,
  share_news_points: 10,
  comment_points: 5,
  like_points: 5,
  daily_login_points: 5,
};

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const age = Math.floor((Date.now() - date.getTime()) / 1000);
  if (age < 60) return "Just now";
  if (age < 3600) return `${Math.floor(age / 60)} min ago`;
  if (age < 86400) return `${Math.floor(age / 3600)} hr ago`;
  if (age < 604800) return `${Math.floor(age / 86400)} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SectionMark({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`eyebrow ${light ? "text-[var(--lime)]" : "text-[var(--pine)]"}`}>
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />
      {children}
    </p>
  );
}

export default function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://pinecrest.konhito.me";
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [taskPointRules, setTaskPointRules] = useState(defaultTaskPointRules);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      try {
        const [newsResponse, leaderboardResponse] = await Promise.all([
          fetch(`${apiBase}/api/news?page=1&limit=6`),
          fetch(`${apiBase}/api/users/leaderboard/public?limit=1`),
        ]);

        if (active && newsResponse.ok) {
          const result = await newsResponse.json();
          if (result.success && result.data?.articles) setNewsItems(result.data.articles);
        }

        if (active && leaderboardResponse.ok) {
          const result = await leaderboardResponse.json();
          if (result.data?.task_point_rules) {
            setTaskPointRules((current) => ({ ...current, ...result.data.task_point_rules }));
          }
        }
      } catch (error) {
        console.error("Unable to load homepage data:", error);
      } finally {
        if (active) setLoadingNews(false);
      }
    };

    loadHomeData();
    return () => {
      active = false;
    };
  }, [apiBase]);

  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={webApplicationSchema} />

      <div className="pine-page overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
        <section id="home-hero" className="relative isolate min-h-[780px] overflow-hidden bg-[var(--forest)] text-[var(--paper)]">
          <div className="hero-rings absolute -right-[18vw] top-[8vh] -z-10 h-[72vw] w-[72vw] max-h-[860px] max-w-[860px] rounded-full border border-[var(--lime)]/20" />
          <div className="hero-rings absolute right-[7vw] top-[24vh] -z-10 h-[38vw] w-[38vw] max-h-[470px] max-w-[470px] rounded-full border border-[var(--lime)]/25" />
          <div className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(231,239,218,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(231,239,218,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="mx-auto flex min-h-[780px] w-full max-w-[1440px] flex-col justify-between px-6 pb-10 pt-32 sm:px-10 lg:px-16">
            <div className="grid items-end gap-16 lg:grid-cols-[1.12fr_.88fr]">
              <motion.div initial="hidden" animate="visible" variants={reveal}>
                <SectionMark light>Social effort, made visible</SectionMark>
                <h1 className="display-heading mt-7 max-w-5xl text-[clamp(4rem,10vw,10rem)] leading-[.82] tracking-[-.075em] text-[var(--paper)]">
                  Make the<br />
                  everyday<br />
                  <span className="text-[var(--lime)]">count.</span>
                </h1>
                <p className="mt-9 max-w-xl text-lg leading-8 text-[var(--paper)]/70 sm:text-xl">
                  Pinecrest turns the small things you already do online into a clear path to points, recognition, and real weekly rewards.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sign-up" className="pine-button pine-button-lime">Start earning <ArrowUpRight size={18} /></Link>
                  <Link href="#features" className="pine-button pine-button-quiet">See how it works</Link>
                </div>
              </motion.div>

              <motion.div className="relative mx-auto w-full max-w-[470px] lg:mb-8" initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <div className="signal-panel relative overflow-hidden rounded-[2rem] border border-[var(--lime)]/20 bg-[var(--forest-deep)] p-5 shadow-2xl sm:p-7">
                  <div className="flex items-center justify-between border-b border-[var(--paper)]/10 pb-5"><div><p className="eyebrow text-[var(--paper)]/50">Your weekly signal</p><p className="mt-2 text-2xl font-semibold tracking-tight">Momentum is building</p></div><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--forest)]"><Sparkles size={20} /></div></div>
                  <div className="relative mt-8 h-48 overflow-hidden rounded-2xl bg-[var(--forest)]/70 p-5">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--lime)]/20" /><div className="absolute inset-x-0 top-1/2 h-px bg-[var(--lime)]/10" /><div className="absolute inset-x-0 top-1/4 h-px bg-[var(--lime)]/10" />
                    <svg viewBox="0 0 420 170" className="absolute inset-0 h-full w-full" role="img" aria-label="A rising weekly points trend"><motion.path d="M0 142 C44 139 55 121 88 126 S128 108 155 112 S194 81 225 92 S264 72 293 78 S332 37 362 49 S396 27 420 18" fill="none" stroke="var(--lime)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} /><motion.path d="M0 142 C44 139 55 121 88 126 S128 108 155 112 S194 81 225 92 S264 72 293 78 S332 37 362 49 S396 27 420 18 V170 H0Z" fill="url(#signal-fill)" initial={{ opacity: 0 }} animate={{ opacity: [0, .55, .55, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} /><defs><linearGradient id="signal-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--lime)" stopOpacity=".3" /><stop offset="1" stopColor="var(--lime)" stopOpacity="0" /></linearGradient></defs></svg>
                    <div className="absolute bottom-4 left-5 text-xs text-[var(--paper)]/45">Mon</div><div className="absolute bottom-4 right-5 text-xs text-[var(--paper)]/45">Sun</div>
                  </div>
                  <div className="mt-5 flex items-end justify-between"><div><p className="text-4xl font-semibold tracking-[-.06em] text-[var(--lime)]">+{taskPointRules.signup_points + taskPointRules.share_social_points}</p><p className="mt-1 text-sm text-[var(--paper)]/50">points available to start</p></div><ArrowUpRight className="text-[var(--lime)]" size={25} /></div>
                </div>
              </motion.div>
            </div>

            <motion.div className="flex items-center justify-between border-t border-[var(--paper)]/15 pt-5 text-xs uppercase tracking-[.18em] text-[var(--paper)]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8 }}><span>01 / Start where you are</span><a href="#features" className="flex items-center gap-2 text-[var(--lime)]" aria-label="Scroll to how it works">Scroll to explore <ArrowDownRight size={15} /></a></motion.div>
          </div>
        </section>

        <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] px-6 py-9 sm:px-10 lg:px-16"><div className="mx-auto grid max-w-[1440px] gap-7 text-sm sm:grid-cols-3 sm:gap-0"><div className="flex items-center gap-3 sm:border-r sm:border-[var(--ink)]/15"><ShieldCheck size={18} className="text-[var(--pine)]" /><span>Clear task verification</span></div><div className="flex items-center gap-3 sm:justify-center sm:border-r sm:border-[var(--ink)]/15"><Trophy size={18} className="text-[var(--pine)]" /><span>Weekly leaderboard rewards</span></div><div className="flex items-center gap-3 sm:justify-end"><Coins size={18} className="text-[var(--pine)]" /><span>No fee to get started</span></div></div></section>

        <section className="px-6 pb-28 pt-12 sm:px-10 lg:px-16 lg:pb-40 lg:pt-20"><div className="mx-auto max-w-[1440px]"><div className="grid gap-5 lg:grid-cols-4 lg:grid-rows-2"><figure className="group relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[var(--forest)] lg:col-span-2 lg:row-span-2 lg:min-h-[560px]"><img src="/editorial/pinecrest-hero-editorial-v2.png" alt="A person making a small online action at a sunlit table" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[66%_center] transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[var(--forest)]/90 via-[var(--forest)]/35 to-transparent" /><figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><SectionMark light>Made of small moments</SectionMark></figcaption></figure><figure className="group relative min-h-[240px] overflow-hidden rounded-[1.5rem] bg-[var(--forest)] lg:col-span-2"><img src="/editorial/pinecrest-community-editorial-v2.png" alt="Two friends sharing an idea on a phone" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></figure><figure className="group relative min-h-[240px] overflow-hidden rounded-[1.5rem] bg-[var(--forest)]"><img src="/editorial/pinecrest-proof-editorial-v2.png" alt="A completed task marked in a notebook beside a phone" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></figure><figure className="group relative min-h-[240px] overflow-hidden rounded-[1.5rem] bg-[var(--forest)]"><img src="/editorial/pinecrest-detail-editorial-v2.png" alt="A notebook, pencil, tea, and phone in warm morning light" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></figure></div></div></section>

        <section id="features" className="px-6 py-28 sm:px-10 lg:px-16 lg:py-40"><div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-28"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={reveal}><SectionMark>The Pinecrest method</SectionMark><h2 className="display-heading mt-6 max-w-xl text-5xl leading-[.94] tracking-[-.065em] sm:text-7xl">A better rhythm for showing up.</h2><p className="mt-7 max-w-md text-lg leading-8 text-[var(--ink-muted)]">Progress should feel less like a casino and more like a trail marker. Do the thing. See it verified. Keep moving.</p><Link href="/about" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[.14em] text-[var(--pine)]">Why Pinecrest <MoveUpRight size={16} /></Link></motion.div><div className="space-y-0">{[{ no: "01", title: "Choose a small action", copy: "Share, watch, comment, or check in. The best task is the one that fits naturally into your day.", icon: Eye }, { no: "02", title: "Let the proof do the work", copy: "Every task is checked before it becomes progress, so the number in your account stays meaningful.", icon: CircleCheck }, { no: "03", title: "Turn momentum into reward", copy: "Climb the weekly board, collect your PineCoins, and come back with a little more momentum.", icon: Gift }].map(({ no, title, copy, icon: Icon }) => <motion.div key={no} className="group grid gap-5 border-t border-[var(--ink)]/15 py-8 sm:grid-cols-[64px_1fr_42px] sm:items-start" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .4 }} variants={reveal}><span className="font-mono text-xs tracking-[.16em] text-[var(--pine)]">{no}</span><div><h3 className="text-2xl font-semibold tracking-[-.035em]">{title}</h3><p className="mt-3 max-w-xl leading-7 text-[var(--ink-muted)]">{copy}</p></div><Icon className="mt-1 text-[var(--pine)] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" size={22} /></motion.div>)}</div></div></section>

        <section id="leaderboard" className="relative overflow-hidden bg-[var(--pine)] px-6 py-24 text-[var(--paper)] sm:px-10 lg:px-16 lg:py-32"><div className="absolute -right-28 top-12 h-72 w-72 rounded-full border border-[var(--lime)]/20" /><div className="absolute -right-6 top-32 h-44 w-44 rounded-full border border-[var(--lime)]/20" /><div className="relative mx-auto grid max-w-[1440px] items-start gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-28"><div><SectionMark light>Every week has a story</SectionMark><h2 className="display-heading mt-6 max-w-lg text-5xl leading-[.93] tracking-[-.065em] sm:text-7xl">Bring your name to the top.</h2><p className="mt-7 max-w-md text-lg leading-8 text-[var(--paper)]/65">The leaderboard keeps the finish line visible. Top performers earn recognition and PineCoins when the week closes.</p><Link href="/leaderboard" className="pine-button pine-button-lime mt-9">Open leaderboard <ArrowUpRight size={18} /></Link></div><div className="rounded-[1.75rem] border border-[var(--paper)]/15 bg-[var(--forest)]/35 p-5 sm:p-8"><div className="mb-6 flex items-center justify-between border-b border-[var(--paper)]/15 pb-5"><span className="eyebrow text-[var(--paper)]/50">This week</span><span className="flex items-center gap-2 text-sm text-[var(--lime)]"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--lime)]" /> Live points</span></div><div className="space-y-1">{[{ rank: "01", name: "The pace setter", score: "2,480" }, { rank: "02", name: "Quiet momentum", score: "2,160" }, { rank: "03", name: "One to watch", score: "1,940" }].map((row, index) => <div key={row.rank} className={`grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-xl px-4 py-5 ${index === 0 ? "bg-[var(--lime)] text-[var(--forest)]" : "text-[var(--paper)]"}`}><span className="font-mono text-xs opacity-60">{row.rank}</span><span className="font-medium">{row.name}</span><span className="font-mono text-sm">{row.score} <span className="ml-1 opacity-50">pts</span></span></div>)}</div><div className="mt-7 flex items-center justify-between border-t border-[var(--paper)]/15 pt-5 text-sm"><span className="text-[var(--paper)]/55">Your next move</span><span className="flex items-center gap-2 text-[var(--lime)]">+{taskPointRules.referral_points} invite <ArrowUpRight size={15} /></span></div></div></div></section>

        <section id="news" className="px-6 py-28 sm:px-10 lg:px-16 lg:py-40"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-6 border-b border-[var(--ink)]/15 pb-7 sm:flex-row sm:items-end"><div><SectionMark>From the Pinecrest field notes</SectionMark><h2 className="display-heading mt-5 text-5xl tracking-[-.06em] sm:text-7xl">Worth your attention.</h2></div><Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[.14em] text-[var(--pine)]">All updates <ArrowUpRight size={16} /></Link></div>{loadingNews ? <div className="py-16 text-[var(--ink-muted)]">Loading the latest notes...</div> : newsItems.length === 0 ? <div className="py-16 text-[var(--ink-muted)]">New notes are on their way.</div> : <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">{newsItems.slice(0, 4).map((news, index) => <Link href={`/news/${news.slug}`} key={news.id} className={`news-feature group ${index === 0 ? "lg:row-span-2" : ""}`}><div className={`relative overflow-hidden bg-[var(--ink-soft)] ${index === 0 ? "aspect-[1.1] lg:aspect-auto lg:h-full" : "aspect-[1.8]"}`}>{news.featured_image ? <img src={resolveNewsImageUrl(news.featured_image, apiBase) || undefined} alt={news.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(event) => { event.currentTarget.src = "/Icon.png"; }} /> : <div className="flex h-full items-center justify-center text-[var(--pine)]"><Newspaper size={40} /></div>}<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-20 text-[var(--paper)]"><span className="eyebrow text-[var(--lime)]">{news.tags?.[0] || news.category || "Pinecrest"} · {formatDate(news.published_at)}</span><h3 className={`${index === 0 ? "text-3xl sm:text-5xl" : "text-xl"} mt-2 max-w-xl font-semibold leading-[1.02] tracking-[-.045em]`}>{news.title}</h3></div></div></Link>)}</div>}</div></section>

        <section id="about" className="border-t border-[var(--ink)]/10 bg-[var(--paper-deep)] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-28"><div><SectionMark>A note from Pinecrest</SectionMark><p className="mt-5 text-sm uppercase tracking-[.16em] text-[var(--ink-muted)]">Built for people who are already showing up.</p></div><div><p className="max-w-4xl text-3xl leading-[1.08] tracking-[-.045em] sm:text-5xl">We believe the internet should give something back for the attention, care, and consistency people bring to it.</p><div className="mt-10 grid gap-7 border-t border-[var(--ink)]/15 pt-7 sm:grid-cols-3"><div><p className="text-3xl font-semibold tracking-[-.05em]">{taskPointRules.signup_points}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">points to begin</p></div><div><p className="text-3xl font-semibold tracking-[-.05em]">{taskPointRules.referral_points}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">points per referral</p></div><div><p className="text-3xl font-semibold tracking-[-.05em]">100%</p><p className="mt-1 text-sm text-[var(--ink-muted)]">clear progress</p></div></div></div></div></section>

        <section className="bg-[var(--paper)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"><div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center"><SectionMark>Begin with one small move</SectionMark><h2 className="display-heading mx-auto mt-6 block w-full max-w-4xl text-center text-6xl leading-[.88] tracking-[-.075em] sm:text-8xl">Your next reward is closer than it looks.</h2><p className="mx-auto mt-8 max-w-xl text-center text-lg leading-8 text-[var(--ink-muted)]">Join for free, pick a task, and make the first point count.</p><div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/sign-up" className="pine-button pine-button-dark">Create your account <ArrowUpRight size={18} /></Link><Link href="/sign-in" className="pine-button pine-button-outline">Already a member? Sign in</Link></div></div></section>

        <footer className="bg-[var(--forest)] px-6 py-12 text-[var(--paper)] sm:px-10 lg:px-16"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-10 border-b border-[var(--paper)]/15 pb-10 md:flex-row md:items-end"><div><Link href="/" className="flex items-center gap-3"><img src="/Icon.png" alt="Pinecrest" className="h-9 w-7 object-contain" /><span className="text-xl font-semibold tracking-[-.04em]">Pinecrest</span></Link><p className="mt-5 max-w-sm text-sm leading-6 text-[var(--paper)]/55">Small actions. Clear progress. A fairer way to earn from showing up online.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm text-[var(--paper)]/65 sm:grid-cols-3"><Link href="/news" className="hover:text-[var(--lime)]">News</Link><Link href="/leaderboard" className="hover:text-[var(--lime)]">Leaderboard</Link><Link href="/about" className="hover:text-[var(--lime)]">About</Link><Link href="/help" className="hover:text-[var(--lime)]">Help</Link><Link href="/privacy" className="hover:text-[var(--lime)]">Privacy</Link><Link href="/terms" className="hover:text-[var(--lime)]">Terms</Link></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-xs uppercase tracking-[.14em] text-[var(--paper)]/35 sm:flex-row"><span>© {new Date().getFullYear()} Pinecrest</span><span>Make the everyday count.</span></div></div></footer>
      </div>
    </>
  );
}
