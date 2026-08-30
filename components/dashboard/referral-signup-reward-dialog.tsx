"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PENDING_REWARD_KEY = "pinecoin_pending_referral_signup_reward";

type ReferralSignupReward = {
  signupPoints: number;
  referralPoints: number;
};

export function ReferralSignupRewardDialog() {
  const [reward, setReward] = useState<ReferralSignupReward | null>(null);

  useEffect(() => {
    const rawReward = sessionStorage.getItem(PENDING_REWARD_KEY);
    if (!rawReward) return;

    try {
      const parsedReward = JSON.parse(rawReward);
      const signupPoints = Number(parsedReward.signupPoints);
      const referralPoints = Number(parsedReward.referralPoints);
      if (Number.isFinite(signupPoints) && signupPoints >= 0) {
        setReward({ signupPoints, referralPoints: Number.isFinite(referralPoints) ? referralPoints : 0 });
      }
    } catch {
      sessionStorage.removeItem(PENDING_REWARD_KEY);
    }
  }, []);

  const acknowledge = () => {
    sessionStorage.removeItem(PENDING_REWARD_KEY);
    setReward(null);
    window.dispatchEvent(new Event("referralSignupRewardAcknowledged"));
  };

  return (
    <Dialog open={Boolean(reward)} onOpenChange={(open) => !open && acknowledge()}>
      <DialogContent className="max-w-sm border-emerald-200 bg-emerald-50 p-6">
        <DialogHeader className="items-center text-center sm:items-start sm:text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl text-emerald-950">Referral applied</DialogTitle>
          <DialogDescription className="text-emerald-800">
            Your account is ready and the invitation has been recorded.
          </DialogDescription>
        </DialogHeader>
        <div className="border-y border-emerald-200 py-4 text-sm text-emerald-950">
          <div className="flex items-baseline justify-between gap-4">
            <span>Signup reward</span>
            <strong>+{reward?.signupPoints ?? 0} points</strong>
          </div>
          <p className="mt-2 text-emerald-800">Your inviter receives +{reward?.referralPoints ?? 0} referral points.</p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={acknowledge} className="w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto">
            Continue to dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
