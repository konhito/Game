"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { telegramService, TelegramConnectionStatus } from "@/lib/telegram-service";

export function TelegramConnectionCard() {
  const [status, setStatus] = useState<TelegramConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    telegramService.getStatus()
      .then(setStatus)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const createLink = async () => {
    setCreating(true);
    try {
      setStatus(await telegramService.createLink());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create Telegram link");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async () => {
    if (!status?.link_value) return;
    await navigator.clipboard.writeText(status.link_value);
    toast.success("Telegram connection link copied");
  };

  const verifyChannel = async () => {
    setVerifying(true);
    try {
      const result = await telegramService.verifyReferralChannel();
      setStatus((current) => current?.account ? {
        ...current,
        account: {
          ...current.account,
          referral_channel_joined: result.channel_joined,
          referral_channel_checked_at: result.checked_at,
        },
      } : current);
      if (result.channel_joined) toast.success("Telegram channel membership confirmed");
      else toast.info("Join the channel first, then verify again");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not verify channel membership");
    } finally {
      setVerifying(false);
    }
  };

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const referralChannelUrl = process.env.NEXT_PUBLIC_TELEGRAM_REFERRAL_CHANNEL_URL;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Telegram
            </CardTitle>
            <CardDescription className="mt-1">
              Complete Pinecrest tasks and receive point updates in Telegram.
            </CardDescription>
          </div>
          {!loading && (
            <Badge variant={status?.linked ? "default" : "secondary"}>
              {status?.linked ? "Connected" : "Not connected"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralChannelUrl && (
          <Button variant="outline" asChild>
            <a href={referralChannelUrl} target="_blank" rel="noreferrer">
              Join Pinecrest Telegram channel <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
        {loading ? (
          <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-4 w-2/3" /></div>
        ) : status?.linked ? (
          <div className="flex items-start gap-3 rounded-md border bg-muted/40 p-4">
            <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div className="min-w-0">
              <p className="font-medium">
                {status.account?.telegram_username
                  ? `@${status.account.telegram_username}`
                  : status.account?.telegram_first_name || "Telegram account"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This connection is permanent. Contact support if you need it removed.
              </p>
              <p className="mt-2 text-sm">
                {status.account?.referral_channel_joined
                  ? "Channel membership verified for referrals."
                  : "Join the channel and verify membership to qualify referrals."}
              </p>
              <Button className="mt-3" variant="outline" onClick={verifyChannel} disabled={verifying}>
                {verifying ? "Checking membership..." : "Verify channel membership"}
              </Button>
            </div>
          </div>
        ) : status?.link_value ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copy this private link and paste it into the Pinecrest Telegram bot. It stays valid until used.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={copyLink} className="sm:flex-1">
                <Copy className="mr-2 h-4 w-4" /> Copy private link
              </Button>
              {botUsername && (
                <Button variant="outline" asChild>
                  <a href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer">
                    Open bot <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Do not share this link. It connects Telegram to your Pinecrest account.</p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-muted-foreground">
              Generate a private, non-expiring connection link. Each Pinecrest account supports one Telegram account.
            </p>
            <Button onClick={createLink} disabled={creating}>
              {creating ? "Generating..." : "Generate link"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
