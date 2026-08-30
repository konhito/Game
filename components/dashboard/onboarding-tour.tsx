"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Gift, Sparkles, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth-service";

type TourStep = {
  title: string;
  description: string;
  icon: typeof Sparkles;
};

const PENDING_REFERRAL_REWARD_KEY = "pinecoin_pending_referral_signup_reward";

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Pinecrest",
    description: "Your dashboard keeps your points, prizes, and next actions in one place.",
    icon: Sparkles,
  },
  {
    title: "Complete activities",
    description: "Open Tasks to complete verified activities and add points to this week's leaderboard score.",
    icon: Gift,
  },
  {
    title: "Track your progress",
    description: "Your weekly points determine your leaderboard position. Check the board often to see where you stand.",
    icon: Trophy,
  },
  {
    title: "Invite your circle",
    description: "Share your five-digit referral code from the account menu to earn points when an invite signs up.",
    icon: Users,
  },
];

function getTourStorageKey() {
  const userId = authService.getUser()?.id;
  return `pinecoin_tour_completed:v2:${userId || "anonymous"}`;
}

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
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

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

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
              <StepIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950" id="onboarding-title">
              {step.title}
            </h2>
            <p className="mt-2 max-w-[38ch] text-sm leading-6 text-slate-600" id="onboarding-description">
              {step.description}
            </p>

            <div className="mt-7 flex gap-1.5" aria-label={`Step ${currentStep + 1} of ${tourSteps.length}`}>
              {tourSteps.map((tourStep, index) => (
                <span
                  aria-hidden="true"
                  className={`h-1.5 flex-1 ${index <= currentStep ? "bg-emerald-600" : "bg-slate-200"}`}
                  key={tourStep.title}
                />
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <Button
                disabled={isFirstStep}
                onClick={() => setCurrentStep((stepIndex) => Math.max(0, stepIndex - 1))}
                type="button"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={() => (isLastStep ? completeTour() : setCurrentStep((stepIndex) => stepIndex + 1))}
                type="button"
              >
                {isLastStep ? "Start earning" : "Continue"}
                {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
