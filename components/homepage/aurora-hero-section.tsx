"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { AuroraHero } from "@/components/ui/hero-2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Coins, ShieldCheck, Sparkles, Star, Trophy } from "lucide-react";
import { siteTheme } from "@/lib/theme";

export function AuroraHeroSection() {
  return (
    <AuroraHero className="h-screen justify-start pt-20 sm:pt-24 md:pt-28">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-1.5 md:mx-0 ${siteTheme.hero.pill}`}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Earn PineCoins for real activities
              </span>
              <Badge variant="secondary" className="rounded-full">
                New
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              Turn social engagement into{" "}
              <span className={siteTheme.hero.highlightText}>
                rewards that feel real
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0"
            >
              Share, watch, refer, and keep your streak. PineCrest tracks your
              activity and turns it into PineCoins you can redeem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
              className="mt-7 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center md:justify-start"
            >
              <Button asChild className="rounded-xl px-6 py-5">
                <Link href="/sign-up">
                  Start earning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-6 py-5">
                <Link href="/#features">See how it works</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground md:justify-start"
            >
              <div className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">4.9</span>
                <span>rating</span>
              </div>
              <div className="h-4 w-px bg-border/70" />
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Secure sign-in</span>
              </div>
              <div className="h-4 w-px bg-border/70" />
              <div className="inline-flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Weekly leaderboard prizes</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              className="mt-8 grid gap-3 sm:grid-cols-3"
            >
              {[
                {
                  icon: Coins,
                  title: "Instant points",
                  description: "Earn PineCoins as you complete tasks.",
                },
                {
                  icon: ShieldCheck,
                  title: "Proof you control",
                  description: "Clear history, clear rules, no surprises.",
                },
                {
                  icon: Trophy,
                  title: "Rank up weekly",
                  description: "Compete, climb, and win extra rewards.",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="group"
                >
                  <Card className={`h-full rounded-2xl p-4 ${siteTheme.hero.softCard}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-lg md:max-w-none"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/70 shadow-lg backdrop-blur">
              <div className={`absolute inset-0 ${siteTheme.hero.imageOverlay}`} />
              <Image
                src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="A clean desk with screens showing analytics"
                width={1200}
                height={900}
                className="relative aspect-[4/3] w-full object-cover"
                priority
              />
            </div>

            <div className="pointer-events-none absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-3">
              {[
                { label: "Signup bonus", value: "50" },
                { label: "Daily streak", value: "+5" },
                { label: "Referral", value: "30" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-background/80 p-3 text-center shadow-sm backdrop-blur"
                >
                  <div className="text-lg font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraHero>
  );
}
