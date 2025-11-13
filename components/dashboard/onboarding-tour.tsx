"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Trophy, 
  Gift, 
  Target, 
  Calendar,
  TrendingUp,
  Users,
  Settings,
  Zap,
  Star
} from "lucide-react";

interface TourStep {
  id: string;
  target: string; // CSS selector or data attribute
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    target: "body",
    title: "Welcome to PineCoin! 🎉",
    content: "Welcome to your dashboard! This quick tour will help you understand how to earn points, claim rewards, and compete with other players. Let's get started!",
    position: "center",
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    id: "stats-overview",
    target: "[data-tour='stats-cards']",
    title: "Your Stats Overview 📊",
    content: "Here you can see your total points, weekly points, current rank, and PineCoins balance. These stats update in real-time as you complete activities!",
    position: "bottom",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    id: "spin-wheel",
    target: "[data-tour='spin-wheel-card']",
    title: "Daily Spin Wheel 🎯",
    content: "Spin the wheel daily to win 20-150 points plus PineCoins! You get free spins every day, and bonus spins for maintaining a 3-day streak. Click 'Quick Spin' to try your luck!",
    position: "bottom",
    icon: <Target className="w-6 h-6" />
  },
  {
    id: "daily-reward",
    target: "[data-tour='daily-reward-card']",
    title: "Daily Login Rewards 🌅",
    content: "Claim your daily reward to earn bonus points! The longer your streak, the more points you earn. Come back every day to maintain your streak and maximize your rewards!",
    position: "bottom",
    icon: <Calendar className="w-6 h-6" />
  },
  {
    id: "progress-goals",
    target: "[data-tour='progress-card']",
    title: "Progress & Goals 📈",
    content: "Track your level progress, weekly goals, and current streak. Complete tasks and activities to level up and unlock special rewards!",
    position: "bottom",
    icon: <Star className="w-6 h-6" />
  },
  {
    id: "leaderboard",
    target: "[data-tour='leaderboard-card']",
    title: "Weekly Leaderboard 🏆",
    content: "Compete with other players on the weekly leaderboard! Top performers win a share of the ₽5,000 prize pool. Check your rank and see how you stack up!",
    position: "bottom",
    icon: <Trophy className="w-6 h-6" />
  },
  {
    id: "activities",
    target: "[data-tour='activities-card']",
    title: "Recent Activities 📝",
    content: "See your latest point earnings and completed tasks. Track your progress and stay motivated by viewing your activity history!",
    position: "bottom",
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: "navigation",
    target: "[data-tour='navbar']",
    title: "Navigation Menu 🧭",
    content: "Use the navigation menu to access all features: Activities (complete tasks), Rewards (claim prizes), Spin Wheel, Prize Pools, Leaderboard, and Settings.",
    position: "bottom",
    icon: <Users className="w-6 h-6" />
  },
  {
    id: "activities-page",
    target: "[data-tour='nav-activities']",
    title: "Activities & Tasks ✅",
    content: "Visit the Activities page to complete tasks like watching videos, sharing posts, and more. Each task rewards you with points and PineCoins!",
    position: "right",
    icon: <Target className="w-6 h-6" />
  },
  {
    id: "rewards-page",
    target: "[data-tour='nav-rewards']",
    title: "Rewards Store 🎁",
    content: "Exchange your points and PineCoins for amazing rewards! Browse different categories and claim prizes that match your goals.",
    position: "right",
    icon: <Gift className="w-6 h-6" />
  },
  {
    id: "prize-pools",
    target: "[data-tour='nav-prize-pool']",
    title: "Prize Pools 💰",
    content: "Join prize pools by paying an entry fee with PineCoins. Compete with other players and win big prizes! The more you participate, the better your chances.",
    position: "right",
    icon: <Trophy className="w-6 h-6" />
  },
  {
    id: "settings",
    target: "[data-tour='nav-settings']",
    title: "Settings ⚙️",
    content: "Manage your profile, update your information, and customize your account settings. Keep your profile updated to get the best experience!",
    position: "right",
    icon: <Settings className="w-6 h-6" />
  },
  {
    id: "complete",
    target: "body",
    title: "You're All Set! 🚀",
    content: "Congratulations! You now know how to navigate PineCoin. Start earning points by completing activities, spinning the wheel, and claiming daily rewards. Good luck and have fun!",
    position: "center",
    icon: <Sparkles className="w-6 h-6" />
  }
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has completed tour
    const tourCompleted = localStorage.getItem("pinecoin_tour_completed");
    const isNewUser = !tourCompleted;

    if (isNewUser) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        setIsVisible(true);
        updateOverlay();
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (isVisible && currentStep < tourSteps.length) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        updateOverlay();
      }, 100);
      
      window.addEventListener("resize", updateOverlay);
      window.addEventListener("scroll", updateOverlay, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateOverlay);
        window.removeEventListener("scroll", updateOverlay, true);
      };
    }
  }, [currentStep, isVisible]);

  const updateOverlay = () => {
    const step = tourSteps[currentStep];
    if (!step) return;

    const targetElement = step.target === "body" 
      ? document.body 
      : document.querySelector(step.target);

    if (!targetElement || targetElement === document.body) {
      setOverlayStyle({});
      return;
    }

    try {
      const rect = (targetElement as HTMLElement).getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      setOverlayStyle({
        position: "absolute",
        top: `${rect.top + scrollY}px`,
        left: `${rect.left + scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    } catch (error) {
      console.error("Error updating overlay:", error);
      setOverlayStyle({});
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("pinecoin_tour_completed", "true");
    setIsVisible(false);
  };

  if (!isVisible || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const targetElement = step.target === "body" 
    ? document.body 
    : document.querySelector(step.target);

  // Calculate tooltip position
  let tooltipPosition: React.CSSProperties = {};
  if (step.position === "center") {
    tooltipPosition = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 10000,
    };
  } else if (targetElement && targetElement !== document.body) {
    try {
      const rect = (targetElement as HTMLElement).getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      switch (step.position) {
        case "top":
          tooltipPosition = {
            position: "fixed",
            bottom: `${window.innerHeight - rect.top + 20}px`,
            left: `${rect.left + rect.width / 2}px`,
            transform: "translateX(-50%)",
            zIndex: 10000,
          };
          break;
        case "bottom":
          tooltipPosition = {
            position: "fixed",
            top: `${rect.bottom + 20}px`,
            left: `${rect.left + rect.width / 2}px`,
            transform: "translateX(-50%)",
            zIndex: 10000,
          };
          break;
        case "left":
          tooltipPosition = {
            position: "fixed",
            top: `${rect.top + rect.height / 2}px`,
            right: `${window.innerWidth - rect.left + 20}px`,
            transform: "translateY(-50%)",
            zIndex: 10000,
          };
          break;
        case "right":
          tooltipPosition = {
            position: "fixed",
            top: `${rect.top + rect.height / 2}px`,
            left: `${rect.right + 20}px`,
            transform: "translateY(-50%)",
            zIndex: 10000,
          };
          break;
      }
    } catch (error) {
      // Fallback to center if positioning fails
      tooltipPosition = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
      };
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            onClick={step.position === "center" ? undefined : handleNext}
          />

          {/* Highlight Box */}
          {targetElement && targetElement !== document.body && (
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={overlayStyle}
              className="border-4 border-emerald-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none z-[9999]"
            />
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={tooltipPosition}
            className="w-full max-w-md"
          >
            <Card className="bg-white shadow-2xl border-2 border-emerald-500">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Step {currentStep + 1} of {tourSteps.length}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((currentStep + 1) / tourSteps.length) * 100}%` 
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {step.content}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstStep}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {!isLastStep && (
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="text-slate-600"
                      >
                        Skip Tour
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center gap-2"
                    >
                      {isLastStep ? "Get Started!" : "Next"}
                      {!isLastStep && <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arrow pointing to target */}
            {targetElement && targetElement !== document.body && step.position !== "center" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute w-0 h-0"
                style={{
                  ...(step.position === "bottom" && {
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderBottom: "12px solid white",
                  }),
                  ...(step.position === "top" && {
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "12px solid white",
                  }),
                  ...(step.position === "right" && {
                    right: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderTop: "12px solid transparent",
                    borderBottom: "12px solid transparent",
                    borderRight: "12px solid white",
                  }),
                  ...(step.position === "left" && {
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderTop: "12px solid transparent",
                    borderBottom: "12px solid transparent",
                    borderLeft: "12px solid white",
                  }),
                }}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

