"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextAnimate } from "@/components/ui/text-animate";
import { Button } from "@/components/ui/button";

interface PineHeroSectionProps {
  signupPoints: number;
  referralPoints: number;
}

export function PineHeroSection({
  signupPoints,
  referralPoints,
}: PineHeroSectionProps) {
  return (
    <div id="home-hero" className="relative z-10 min-h-[100svh] w-full overflow-hidden">
      <AuroraBackground
        className="bg-transparent"
        style={{
          backgroundColor: "transparent",
          background: "transparent",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.2,
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative z-10 flex min-h-[100svh] w-full flex-col items-center justify-center px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-0"
          style={{ willChange: "opacity, transform" }}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center">
              <h1 className="mb-3 text-center text-2xl font-semibold leading-tight tracking-[-0.02em] text-gray-900/90 sm:text-3xl md:mb-4 md:text-4xl lg:text-5xl">
              Turn Your Social Activity
              <br />
              Into Weekly Rewards
            </h1>

            <div className="mx-auto mb-4 h-px w-10 bg-gray-400/70 sm:w-12 md:mb-6" />

              <TextAnimate
                by="word"
                animation="blurInUp"
                startOnView={false}
                delay={1.9}
                duration={0.75}
                className="px-4 text-center text-base font-normal text-gray-600 sm:text-lg md:text-xl"
              >
                Earn from daily social actions and referrals
              </TextAnimate>

            <div className="mt-5 w-full max-w-xl rounded-lg border border-slate-200/70 bg-white/80 p-3 shadow-sm sm:mt-6 sm:p-4">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <div className="flex-1 text-center">
                  <div className="text-lg font-semibold text-emerald-700 sm:text-xl">
                    {signupPoints} points
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">Signup bonus</div>
                </div>
                <div className="hidden h-10 w-px bg-slate-300 sm:block" />
                <div className="block h-px w-full bg-slate-200 sm:hidden" />
                <div className="flex-1 text-center">
                  <div className="text-lg font-semibold text-teal-700 sm:text-xl">
                    {referralPoints} points
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">Referral reward</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex w-full max-w-sm flex-col gap-2 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg sm:w-auto sm:px-8 sm:py-3.5 sm:text-base">
                  Start Earning Now
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </AuroraBackground>

    </div>
  );
}
