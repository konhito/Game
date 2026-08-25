import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageSquare, TrendingUp, Trophy, Users } from "lucide-react";

const features = [
  { icon: Users, title: "People in motion", copy: "A community of users building small habits that add up." },
  { icon: Trophy, title: "A visible finish line", copy: "Weekly competition keeps progress tangible and fair." },
  { icon: MessageSquare, title: "Useful conversation", copy: "Share what works, learn from others, and keep it honest." },
  { icon: TrendingUp, title: "Growth together", copy: "The strongest wins are the ones other people can repeat." },
];

const topUsers = [
  { rank: "01", name: "Alex M.", points: "12,500", coins: "2,500" },
  { rank: "02", name: "Sarah K.", points: "11,800", coins: "2,300" },
  { rank: "03", name: "Mike T.", points: "11,200", coins: "2,100" },
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="bg-[var(--forest)] px-6 pb-24 pt-36 text-[var(--paper)] sm:px-10 lg:px-16 lg:pb-32"><div className="mx-auto max-w-[1440px]"><Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--paper)]/55 hover:text-[var(--lime)]"><ArrowLeft size={16} /> Back home</Link><p className="eyebrow mt-20 text-[var(--lime)]"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current" /> The Pinecrest community</p><h1 className="display-heading mt-7 max-w-5xl text-6xl leading-[.86] tracking-[-.075em] sm:text-9xl">Good momentum is contagious.</h1><p className="mt-9 max-w-2xl text-xl leading-8 text-[var(--paper)]/65">A place to compare notes, celebrate progress, and keep the work of earning online grounded in something real.</p></div></section>
      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto max-w-[1440px]"><p className="eyebrow text-[var(--pine)]">The room we are building</p><div className="mt-10 grid gap-x-10 border-t border-[var(--ink)]/15 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, copy }) => <div key={title} className="border-b border-[var(--ink)]/15 py-8 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0"><Icon size={22} className="text-[var(--pine)]" /><h2 className="mt-6 text-2xl font-semibold tracking-[-.035em]">{title}</h2><p className="mt-3 leading-7 text-[var(--ink-muted)]">{copy}</p></div>)}</div></div></section>
      <section className="bg-[var(--paper-deep)] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-28"><div><p className="eyebrow text-[var(--pine)]">A live snapshot</p><h2 className="display-heading mt-5 text-5xl leading-[.94] tracking-[-.065em] sm:text-7xl">The people setting the pace.</h2><p className="mt-7 max-w-md text-lg leading-8 text-[var(--ink-muted)]">The top of the board is not a mystery. It is a collection of consistent, verified actions.</p><Link href="/dashboard/leaderboard" className="pine-button pine-button-dark mt-9">View full leaderboard <ArrowUpRight size={18} /></Link></div><div className="border-t border-[var(--ink)]/15">{topUsers.map((user, index) => <div key={user.rank} className="grid grid-cols-[48px_1fr_auto] items-center gap-5 border-b border-[var(--ink)]/15 py-7"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? "bg-[var(--forest)] text-[var(--lime)]" : "bg-[var(--ink)]/10 text-[var(--ink-muted)]"}`}>{user.rank}</span><div><p className="text-xl font-semibold tracking-[-.03em]">{user.name}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">{user.points} points</p></div><p className="text-right font-mono text-sm text-[var(--pine)]">{user.coins}<span className="ml-1 text-[var(--ink-muted)]">coins</span></p></div>)}</div></div></section>
      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.55fr_1.45fr] lg:gap-28"><div><p className="eyebrow text-[var(--pine)]">Community code</p><p className="mt-5 text-sm uppercase tracking-[.14em] text-[var(--ink-muted)]">A few things worth protecting</p></div><div className="grid gap-8 sm:grid-cols-2"><div><h3 className="text-xl font-semibold">Be useful</h3><p className="mt-3 leading-7 text-[var(--ink-muted)]">Share legitimate tips and strategies that help people participate fairly.</p></div><div><h3 className="text-xl font-semibold">Be respectful</h3><p className="mt-3 leading-7 text-[var(--ink-muted)]">Make space for new users and treat every person as a person.</p></div><div><h3 className="text-xl font-semibold">Be consistent</h3><p className="mt-3 leading-7 text-[var(--ink-muted)]">The best progress is repeatable, not inflated by shortcuts.</p></div><div><h3 className="text-xl font-semibold">Be accountable</h3><p className="mt-3 leading-7 text-[var(--ink-muted)]">Follow the rules so rewards stay meaningful for everyone.</p></div></div></div></section>
    </main>
  );
}
