"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/privacy-policy");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600">Redirecting to privacy policy...</p>
      </div>
    </div>
  );
}

