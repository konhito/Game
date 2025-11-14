"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/terms-of-service");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600">Redirecting to terms of service...</p>
      </div>
    </div>
  );
}


