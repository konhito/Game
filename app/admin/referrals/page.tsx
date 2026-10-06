"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import config from "@/lib/config";

type Agent = {
  id: number;
  name: string;
  email: string;
  referral_code: string;
  referral_count: number;
  qualified_count: number;
  earned_naira: number;
  payable_naira: number;
};

type Referral = {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  telegram_username: string | null;
  telegram_linked: boolean;
  telegram_channel_joined: boolean;
  referral_channel_checked_at: string | null;
  qualified: boolean;
};

type ReferralPage = {
  referrals: Referral[];
  pagination: { page: number; pages: number; total: number };
};

const money = (amount: number) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(amount);

async function adminGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Please sign in again");
  const response = await fetch(`${config.API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.error || "Request failed");
  return payload.data as T;
}

export default function AdminReferralsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [referralPage, setReferralPage] = useState<ReferralPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGet<Agent[]>("/api/admin/referrals")
      .then((result) => {
        setAgents(result);
        if (result[0]) setSelectedAgent(result[0]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load referrals"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;
    let current = true;
    setDetailLoading(true);
    adminGet<ReferralPage>(`/api/admin/referrals/${selectedAgent.id}?page=${page}&limit=50`)
      .then((result) => { if (current) setReferralPage(result); })
      .catch((err) => { if (current) setError(err instanceof Error ? err.message : "Failed to load referral list"); })
      .finally(() => { if (current) setDetailLoading(false); });
    return () => { current = false; };
  }, [selectedAgent, page]);

  const chooseAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setPage(1);
    setReferralPage(null);
    setError("");
  };

  const totalReferrals = agents.reduce((sum, agent) => sum + agent.referral_count, 0);
  const totalQualified = agents.reduce((sum, agent) => sum + agent.qualified_count, 0);

  if (loading) return <p className="p-6 text-slate-600">Loading referral program...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Admin dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Referral program</h1>
          <p className="mt-1 text-slate-600">₦25 per qualified referral; payout unlocks at 1,000 qualified signups.</p>
        </div>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Referral accounts</p><p className="mt-1 text-2xl font-semibold">{agents.length.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Signups with a code</p><p className="mt-1 text-2xl font-semibold">{totalReferrals.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Qualified signups</p><p className="mt-1 text-2xl font-semibold">{totalQualified.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader><CardTitle>Referral accounts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {agents.length === 0 ? <p className="text-sm text-slate-500">No referral accounts found.</p> : agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => chooseAgent(agent)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${selectedAgent?.id === agent.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0"><span className="block truncate font-medium text-slate-900">{agent.name}</span><span className="block truncate text-sm text-slate-500">{agent.email}</span></span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </span>
                <span className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">Code {agent.referral_code}</Badge>
                  <Badge variant="outline">{agent.qualified_count}/{agent.referral_count} qualified</Badge>
                </span>
                <span className="mt-3 block text-sm text-slate-600">
                  Earned {money(agent.earned_naira)} · payout unlocked {money(agent.payable_naira)}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{selectedAgent ? `${selectedAgent.name}'s referrals` : "Referral list"}</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedAgent ? <p className="text-sm text-slate-500">Choose a referral account to view its signups.</p> : detailLoading ? <p className="text-sm text-slate-500">Loading signups...</p> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="py-3 pr-4">Referred user</th><th className="py-3 pr-4">Signup</th><th className="py-3 pr-4">Telegram</th><th className="py-3 pr-4">Channel</th><th className="py-3">Commission</th></tr></thead>
                    <tbody>
                      {referralPage?.referrals.map((referral) => (
                        <tr key={referral.id} className="border-b last:border-0">
                          <td className="py-3 pr-4"><span className="block font-medium text-slate-900">{referral.name}</span><span className="text-xs text-slate-500">{referral.email}</span><span className="block text-xs text-slate-400">ID {referral.id} · email {referral.is_verified ? "verified" : "unverified"}</span></td>
                          <td className="py-3 pr-4 whitespace-nowrap text-slate-600">{new Date(referral.created_at).toLocaleDateString()}</td>
                          <td className="py-3 pr-4">{referral.telegram_linked ? <Badge variant="default">{referral.telegram_username ? `@${referral.telegram_username}` : "Linked"}</Badge> : <Badge variant="outline">Not linked</Badge>}</td>
                          <td className="py-3 pr-4">{referral.referral_channel_checked_at ? referral.telegram_channel_joined ? <Badge variant="default">Joined</Badge> : <Badge variant="outline">Not a member</Badge> : <Badge variant="outline">Not checked</Badge>}</td>
                          <td className="py-3">{referral.qualified ? <Badge className="bg-emerald-100 text-emerald-800">₦25 qualified</Badge> : <Badge variant="outline">Pending</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {referralPage && referralPage.pagination.total === 0 && <p className="py-8 text-center text-sm text-slate-500">No signups used this code yet.</p>}
                {referralPage && referralPage.pagination.pages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-slate-500">
                    <span>Page {page} of {referralPage.pagination.pages} · {referralPage.pagination.total} signups</span>
                    <span className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button>
                      <Button variant="outline" size="sm" disabled={page >= referralPage.pagination.pages} onClick={() => setPage(page + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
