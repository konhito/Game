"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/lib/auth-service";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  const started = useRef(false);
  const [status, setStatus] = useState<"verifying" | "verified" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!token) {
      setError("This verification link is missing a token.");
      setStatus("error");
      return;
    }

    authService.verifyEmail(token)
      .then(() => setStatus("verified"))
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Email verification failed.");
        setStatus("error");
      });
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 border-slate-200/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-slate-800">Verify your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "verifying" && <p className="text-slate-600" role="status">Verifying your email...</p>}
          {status === "verified" && <p className="text-emerald-700" role="status">Email verified. You can now sign in.</p>}
          {status === "error" && <p className="text-red-600" role="alert">{error}</p>}
          <Link href="/sign-in" className="inline-block text-emerald-700 hover:underline">Go to sign in</Link>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center" role="status">Loading verification...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
