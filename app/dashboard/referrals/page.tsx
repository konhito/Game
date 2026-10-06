"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { authService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Copy, Link2, Share2, UserPlus, Users } from "lucide-react";

type TaskPointRules = {
  signup_points: number;
  referral_points: number;
  share_news_points: number;
};

const defaultTaskPointRules: TaskPointRules = {
  signup_points: 50,
  referral_points: 30,
  share_news_points: 10,
};

function buildInviteLink(code: string) {
  if (typeof window === "undefined") return "";
  const url = new URL("/sign-up", window.location.origin);
  url.searchParams.set("ref", code);
  return url.toString();
}

export default function ReferralsPage() {
  const [copiedField, setCopiedField] = useState<"code" | "link" | null>(null);
  const [taskPointRules, setTaskPointRules] = useState<TaskPointRules>(defaultTaskPointRules);
  const [user, setUser] = useState(() => authService.getUser());
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://pinecrest.konhito.me";

  const referralCode = useMemo(() => {
    if (!user) return "";
    const explicitCode = user.referral_code?.trim();
    if (explicitCode) return explicitCode;
    return "";
  }, [user]);

  const inviteLink = useMemo(() => {
    if (!referralCode) return "";
    return buildInviteLink(referralCode);
  }, [referralCode]);

  useEffect(() => {
    if (referralCode) return;

    let isCurrent = true;
    authService.getProfile()
      .then((profile) => {
        if (isCurrent) setUser(profile);
      })
      .catch((error) => {
        console.error("Failed to refresh referral code", error);
      });

    return () => {
      isCurrent = false;
    };
  }, [referralCode]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${apiBase}/api/users/leaderboard/public?limit=1`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = await response.json();
        const rules = result?.data?.task_point_rules;
        if (rules) {
          setTaskPointRules({
            signup_points: Number(rules.signup_points) || defaultTaskPointRules.signup_points,
            referral_points: Number(rules.referral_points) || defaultTaskPointRules.referral_points,
            share_news_points: Number(rules.share_news_points) || defaultTaskPointRules.share_news_points,
          });
        }
      } catch (error) {
        console.error("Failed to fetch referral point rules", error);
      }
    })();
  }, [apiBase]);

  const copyText = async (value: string, field: "code" | "link") => {
    if (!value || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy referral value", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-700">Referrals</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Invite people with your code</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Each referral earns ₦25 after the new account verifies email, links Telegram, and joins the Pinecrest channel. Payout unlocks at 1,000 qualified signups.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard/activities">
              View Tasks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-emerald-200 bg-emerald-50/90 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Cash per qualified referral</p>
                <p className="text-2xl font-semibold text-slate-900">₦25</p>
                <p className="text-xs text-slate-600">Payout unlocks at 1,000</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Referral Points</p>
                <p className="text-2xl font-semibold text-slate-900">+{taskPointRules.referral_points}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Signup Points</p>
                <p className="text-2xl font-semibold text-slate-900">+{taskPointRules.signup_points}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">News Share Points</p>
                <p className="text-2xl font-semibold text-slate-900">+{taskPointRules.share_news_points}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr,0.9fr]">
          <Card className="border-slate-200 bg-white/95 shadow-sm">
            <CardHeader className="space-y-2 border-b border-slate-100 pb-5">
              <CardTitle className="text-xl text-slate-900">Your referral details</CardTitle>
              <CardDescription>
                Share the code directly or send the prefilled signup link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Referral code</span>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    Use at signup
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all text-base font-semibold text-slate-900">{referralCode || "Loading your code..."}</code>
                  <Button type="button" variant="outline" disabled={!referralCode} onClick={() => copyText(referralCode, "code")}>
                    {copiedField === "code" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copiedField === "code" ? "Copied" : "Copy Code"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Invite link</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Auto-fills code
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="break-all text-sm text-slate-700">{inviteLink}</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" onClick={() => copyText(inviteLink, "link")} className="sm:w-auto">
                      {copiedField === "link" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
                      {copiedField === "link" ? "Copied" : "Copy Invite Link"}
                    </Button>
                    <Button asChild type="button" variant="outline" className="sm:w-auto">
                      <Link href={`/sign-up?ref=${encodeURIComponent(referralCode)}`}>Preview Signup Flow</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="border-slate-200 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">How it works</CardTitle>
                <CardDescription>Keep it simple for users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">1. Share your code or link</p>
                  <p className="mt-1">Send the code directly, or share the invite link so the signup form fills it automatically.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">2. New user signs up</p>
                  <p className="mt-1">They create an account and keep the referral code in the signup form.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">3. Points are awarded</p>
                  <p className="mt-1">The new user gets signup points, and the referrer gets referral points.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-900">Point summary</CardTitle>
                <CardDescription className="text-emerald-700">
                  Signup, referral, and sharing all stay points-based here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-emerald-900">
                <div className="flex items-center justify-between rounded-lg bg-white/80 px-4 py-3">
                  <span>New account created</span>
                  <span className="font-semibold">+{taskPointRules.signup_points} points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/80 px-4 py-3">
                  <span>Successful referral</span>
                  <span className="font-semibold">+{taskPointRules.referral_points} points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/80 px-4 py-3">
                  <span>News post share</span>
                  <span className="font-semibold">+{taskPointRules.share_news_points} points</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
