"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Crown, Gift, Info, Loader2, RefreshCw, ShieldCheck, Target, Trophy, Users, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authService } from "@/lib/auth-service";
import { prizePoolService, PrizePool, UserParticipation } from "@/lib/prize-pool-service";

function formatPineCoins(value: number) {
  return `${Number(value || 0).toLocaleString()} PineCoins`;
}

function formatDate(value?: string) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getStatusMeta(status: PrizePool["status"]) {
  if (status === "active") return { label: "Live now", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (status === "upcoming") return { label: "Coming soon", className: "border-sky-200 bg-sky-50 text-sky-700" };
  return { label: "Completed", className: "border-slate-200 bg-slate-100 text-slate-600" };
}

function PrizePoolSkeleton() {
  return <div className="min-h-screen bg-[var(--paper-deep)] pb-12"><div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-72" /><Skeleton className="h-5 w-[min(34rem,80vw)]" /></div><Skeleton className="h-10 w-28" /></div><div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-2xl" />)}</div><Skeleton className="h-80 rounded-2xl" /><div className="grid gap-4 md:grid-cols-2">{[1, 2].map((item) => <Skeleton key={item} className="h-64 rounded-2xl" />)}</div></div></div>;
}

function PrizePoolCard({ pool, entries, featured = false, joiningPool, onJoin }: { pool: PrizePool; entries: number; featured?: boolean; joiningPool: number | null; onJoin: (pool: PrizePool) => void }) {
  const status = getStatusMeta(pool.status);
  const maxParticipants = Math.max(Number(pool.max_participants) || 0, 1);
  const currentParticipants = Math.max(Number(pool.current_participants) || 0, 0);
  const fillPercent = Math.min(100, (currentParticipants / maxParticipants) * 100);
  const isFull = currentParticipants >= maxParticipants;
  const maxEntriesReached = entries >= 10;
  const isJoining = joiningPool === pool.id;

  return <Card className={`overflow-hidden rounded-2xl border-slate-200/80 bg-[var(--paper)] shadow-sm ${featured ? "lg:col-span-2" : ""}`}><div className={`grid ${featured ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" : ""}`}><div className={`relative min-h-44 overflow-hidden ${featured ? "lg:min-h-full" : ""}`}>{pool.image_url ? <img src={pool.image_url} alt={pool.title} className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}<div className={`absolute inset-0 ${pool.image_url ? "bg-gradient-to-t from-[var(--forest)]/85 via-[var(--forest)]/20 to-transparent" : "bg-[var(--forest)]"}`} /><div className="relative flex h-full min-h-44 flex-col justify-between p-5 text-[var(--paper)] sm:p-6"><div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-[var(--paper)]/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"><Gift className="h-3.5 w-3.5" />Prize pool</span><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${pool.image_url ? "border-[var(--paper)]/30 bg-[var(--paper)]/15 text-[var(--paper)]" : "border-[var(--lime)]/40 bg-[var(--lime)]/10 text-[var(--lime)]"}`}>{status.label}</span></div><div className="mt-10"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--paper)]/65">Prize value</p><p className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{formatPineCoins(pool.prize_amount)}</p></div></div></div><CardContent className="flex flex-col justify-between gap-6 p-5 sm:p-7"><div><div className="mb-3 flex items-center gap-2"><Badge variant="outline" className={status.className}>{status.label}</Badge>{entries > 0 && <Badge variant="outline" className="border-[var(--lime)]/50 bg-[var(--lime)]/15 text-[var(--forest)]">{entries} {entries === 1 ? "entry" : "entries"} yours</Badge>}</div><h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{pool.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">{pool.description || "Join this pool before it closes to be included in the draw."}</p></div><div className="grid gap-3 border-y border-[var(--ink)]/10 py-4 sm:grid-cols-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Entry fee</p><p className="mt-1 font-semibold text-[var(--ink)]">{formatPineCoins(pool.entry_fee)}</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Closes</p><p className="mt-1 font-semibold text-[var(--ink)]">{formatDate(pool.end_date)}</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Your entries</p><p className="mt-1 font-semibold text-[var(--ink)]">{entries} / 10</p></div></div><div><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-[var(--ink-muted)]"><Users className="h-4 w-4" />Participation</span><span className="font-semibold text-[var(--ink)]">{currentParticipants.toLocaleString()} / {maxParticipants.toLocaleString()}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--paper-deep)]"><div className="h-full rounded-full bg-[var(--pine)] transition-[width] duration-500" style={{ width: `${fillPercent}%` }} /></div></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs text-[var(--ink-muted)]"><CalendarDays className="h-4 w-4" />Started {formatDate(pool.start_date)}</p><Button onClick={() => onJoin(pool)} disabled={isJoining || isFull || maxEntriesReached} className="w-full bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--pine)] sm:w-auto">{isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : maxEntriesReached ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}{isJoining ? "Joining" : maxEntriesReached ? "Entry limit reached" : isFull ? "Pool full" : `Join for ${formatPineCoins(pool.entry_fee)}`}</Button></div></CardContent></div></Card>;
}

export default function PrizePoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [userParticipations, setUserParticipations] = useState<UserParticipation[]>([]);
  const [joiningPool, setJoiningPool] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const [poolsResponse, participationsResponse] = await Promise.all([prizePoolService.getAllPrizePools(), prizePoolService.getUserParticipations()]);
      if (!poolsResponse.success || !poolsResponse.data) throw new Error(poolsResponse.error || "Failed to load prize pools");
      if (!participationsResponse.success || !participationsResponse.data) throw new Error(participationsResponse.error || "Failed to load your entries");
      setPrizePools(Array.isArray(poolsResponse.data.pools) ? poolsResponse.data.pools : []);
      setUserParticipations(Array.isArray(participationsResponse.data.participations) ? participationsResponse.data.participations : []);
    } catch (loadError: any) {
      console.error("Error loading prize pools:", loadError);
      setError(loadError?.message || "Prize pools could not be loaded.");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    const user = authService.getUser();
    if (!user || !authService.getToken()) { router.push("/sign-in"); return; }
    setCurrentUser(user);
    void loadPage();
  }, [loadPage, router]);

  const activePools = useMemo(() => prizePools.filter((pool) => pool.status === "active"), [prizePools]);
  const upcomingPools = useMemo(() => prizePools.filter((pool) => pool.status === "upcoming"), [prizePools]);
  const completedPools = useMemo(() => prizePools.filter((pool) => pool.status === "completed"), [prizePools]);
  const totalLivePrize = useMemo(() => activePools.reduce((sum, pool) => sum + Number(pool.prize_amount || 0), 0), [activePools]);
  const getEntriesForPool = (poolId: number) => userParticipations.filter((entry) => entry.pool_id === poolId).length;

  const handleJoinPool = async (pool: PrizePool) => {
    if (!currentUser || joiningPool !== null) return;
    setJoiningPool(pool.id);
    try {
      const response = await prizePoolService.joinPrizePool(pool.id);
      if (!response.success) throw new Error(response.error || "Could not join this pool");
      toast.success(`You joined ${pool.title}`);
      await loadPage(true);
    } catch (joinError: any) {
      console.error("Error joining prize pool:", joinError);
      toast.error(joinError?.message || "Could not join this pool. Please try again.");
    } finally { setJoiningPool(null); }
  };

  if (loading) return <PrizePoolSkeleton />;

  return <main className="min-h-screen bg-[var(--paper-deep)] pb-14"><div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col gap-5 border-b border-[var(--ink)]/10 pb-7 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><p className="eyebrow text-[var(--pine)]">Weekly prize pools</p><h1 className="display-heading mt-4 text-5xl leading-[0.94] tracking-[-0.065em] text-[var(--ink)] sm:text-7xl">Put your points to work.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[var(--ink-muted)]">Enter live pools with PineCoins, track your entries, and see exactly when each draw closes.</p></div><Button variant="outline" onClick={() => void loadPage(true)} disabled={refreshing} className="w-full border-[var(--ink)]/15 bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)] sm:w-auto"><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing" : "Refresh pools"}</Button></header>{error && <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm">{error}</p><Button variant="outline" onClick={() => void loadPage()} className="border-rose-200 bg-[var(--paper)] text-rose-700 hover:bg-rose-100">Try again</Button></div>}<section className="grid overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] shadow-sm sm:grid-cols-3" aria-label="Prize pool summary"><div className="border-b border-[var(--ink)]/10 p-5 sm:border-b-0 sm:border-r"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">Live pools</p><p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">{activePools.length}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Open for entry now</p></div><div className="border-b border-[var(--ink)]/10 p-5 sm:border-b-0 sm:border-r"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">Your entries</p><p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">{userParticipations.length}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Across all pools</p></div><div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">Live prize value</p><p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--pine)]">{formatPineCoins(totalLivePrize)}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Combined active pools</p></div></section><section aria-labelledby="live-pools-heading"><div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[var(--pine)]">Open now</p><h2 id="live-pools-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">Choose your pool.</h2></div><p className="text-sm text-[var(--ink-muted)]">Each account can enter a pool up to 10 times.</p></div>{activePools.length === 0 ? <Card className="rounded-2xl border-dashed border-[var(--ink)]/20 bg-[var(--paper)] shadow-none"><CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center"><Clock3 className="h-9 w-9 text-[var(--pine)]" /><h3 className="mt-4 text-xl font-semibold text-[var(--ink)]">No live pools right now</h3><p className="mt-2 max-w-md text-sm leading-6 text-[var(--ink-muted)]">Check back soon. Upcoming pools will appear below as soon as they are scheduled.</p></CardContent></Card> : <div className="grid gap-5 md:grid-cols-2">{activePools.map((pool, index) => <PrizePoolCard key={pool.id} pool={pool} entries={getEntriesForPool(pool.id)} featured={index === 0} joiningPool={joiningPool} onJoin={handleJoinPool} />)}</div>}</section><div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]"><section aria-labelledby="your-entries-heading"><div className="mb-4"><p className="eyebrow text-[var(--pine)]">Your activity</p><h2 id="your-entries-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">Your entries.</h2></div><Card className="rounded-2xl border-[var(--ink)]/10 bg-[var(--paper)] shadow-sm"><CardContent className="p-0">{userParticipations.length === 0 ? <div className="p-6"><WalletCards className="h-8 w-8 text-[var(--pine)]" /><p className="mt-4 font-semibold text-[var(--ink)]">Nothing entered yet.</p><p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Join a live pool and your entries will show here.</p></div> : <div className="divide-y divide-[var(--ink)]/10">{userParticipations.slice(0, 5).map((entry, index) => <div key={`${entry.pool_id}-${entry.joined_at}-${index}`} className="flex items-center justify-between gap-4 p-5"><div className="min-w-0"><p className="truncate font-semibold text-[var(--ink)]">{entry.pool_title}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">Joined {formatDate(entry.joined_at)}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold text-[var(--pine)]">{formatPineCoins(entry.prize_amount)}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{entry.is_winner ? "Winner" : entry.pool_status}</p></div></div>)}</div>}</CardContent></Card></section><section aria-labelledby="upcoming-pools-heading"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow text-[var(--pine)]">Plan ahead</p><h2 id="upcoming-pools-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">Coming next.</h2></div><CalendarDays className="h-6 w-6 text-[var(--pine)]" /></div><Card className="rounded-2xl border-[var(--ink)]/10 bg-[var(--paper)] shadow-sm"><CardContent className="p-0">{upcomingPools.length === 0 ? <p className="p-6 text-sm text-[var(--ink-muted)]">No upcoming pools have been scheduled.</p> : <div className="divide-y divide-[var(--ink)]/10">{upcomingPools.map((pool) => <div key={pool.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[var(--ink)]">{pool.title}</h3><Badge variant="outline" className={getStatusMeta(pool.status).className}>Coming soon</Badge></div><p className="mt-1 text-sm text-[var(--ink-muted)]">Starts {formatDate(pool.start_date)} · Entry {formatPineCoins(pool.entry_fee)}</p></div><p className="font-semibold text-[var(--pine)]">{formatPineCoins(pool.prize_amount)}</p></div>)}</div>}</CardContent></Card></section></div>{completedPools.length > 0 && <section aria-labelledby="past-pools-heading"><div className="mb-4"><p className="eyebrow text-[var(--pine)]">History</p><h2 id="past-pools-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">Past pools.</h2></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{completedPools.map((pool) => <Card key={pool.id} className="rounded-2xl border-[var(--ink)]/10 bg-[var(--paper)] shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><Trophy className="h-5 w-5 text-[var(--pine)]" /><Badge variant="outline" className={getStatusMeta(pool.status).className}>Completed</Badge></div><h3 className="mt-5 font-semibold text-[var(--ink)]">{pool.title}</h3><p className="mt-1 text-sm text-[var(--ink-muted)]">{formatPineCoins(pool.prize_amount)} · Closed {formatDate(pool.end_date)}</p>{pool.winner_name && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pine)]">Winner: {pool.winner_name}</p>}</CardContent></Card>)}</div></section>}<section className="rounded-2xl bg-[var(--forest)] p-6 text-[var(--paper)] sm:p-8" aria-labelledby="how-it-works-heading"><div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-sm"><p className="eyebrow text-[var(--lime)]">Clear rules</p><h2 id="how-it-works-heading" className="mt-3 text-3xl font-semibold tracking-[-0.05em]">How a pool works.</h2><p className="mt-3 text-sm leading-6 text-[var(--paper)]/65">Every pool shows its fee, capacity, timing, and prize before you enter.</p></div><div className="grid flex-1 gap-5 sm:grid-cols-3 lg:max-w-3xl">{[{ icon: Target, title: "Choose", text: "Pick a live pool that fits your balance." }, { icon: ShieldCheck, title: "Enter", text: "Pay the entry fee and receive a recorded entry." }, { icon: Crown, title: "Wait", text: "When it closes, the winner is selected from entries." }].map(({ icon: Icon, title, text }, index) => <div key={title} className="border-t border-[var(--paper)]/20 pt-4"><div className="flex items-center gap-3 text-[var(--lime)]"><span className="font-mono text-xs">0{index + 1}</span><Icon className="h-4 w-4" /></div><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--paper)]/65">{text}</p></div>)}</div></div><div className="mt-8 flex items-start gap-3 border-t border-[var(--paper)]/15 pt-5 text-xs leading-5 text-[var(--paper)]/60"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lime)]" /><p>Entries are limited to 10 per pool. Pool availability and participation counts update when you refresh.</p></div></section>
    </div></main>;
}
