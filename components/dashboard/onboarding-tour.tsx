"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth-service";

const PENDING_REFERRAL_REWARD_KEY = "pinecoin_pending_referral_signup_reward";

function getTourStorageKey() {
  const userId = authService.getUser()?.id;
  return `pinecoin_tour_completed:v2:${userId || "anonymous"}`;
}

export function OnboardingTour() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const showTourWhenReady = () => {
      if (sessionStorage.getItem(PENDING_REFERRAL_REWARD_KEY)) return;
      if (localStorage.getItem(getTourStorageKey())) return;

      timer = setTimeout(() => setIsVisible(true), 300);
    };

    showTourWhenReady();
    window.addEventListener("referralSignupRewardAcknowledged", showTourWhenReady);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("referralSignupRewardAcknowledged", showTourWhenReady);
    };
  }, []);

  const completeTour = () => {
    localStorage.setItem(getTourStorageKey(), "true");
    setIsVisible(false);
  };

  const startFirstTask = () => {
    completeTour();
    router.push("/dashboard/activities");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end bg-slate-950/60 p-3 sm:items-center sm:justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            aria-describedby="onboarding-description"
            aria-labelledby="onboarding-title"
            aria-modal="true"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto border border-slate-200 bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            role="dialog"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Getting started
              </p>
              <button
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                onClick={completeTour}
                type="button"
              >
                Skip
              </button>
            </div>

            <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950" id="onboarding-title">
              Start with one task
            </h2>
            <p className="mt-2 max-w-[38ch] text-sm leading-6 text-slate-600" id="onboarding-description">
              Pick an activity, follow its instructions, then submit proof for review. Approved tasks add points to your weekly total.
            </p>

            <div className="mt-7">
              <Button
                className="w-full bg-emerald-700 hover:bg-emerald-800"
                onClick={startFirstTask}
                type="button"
              >
                Browse tasks
              </Button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
