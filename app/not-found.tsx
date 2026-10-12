import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 number - large and clear */}
        <div className="relative mb-6">
          <span className="text-[10rem] sm:text-[12rem] font-black text-[var(--pine)] leading-none select-none">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
          Page not found
        </h1>
        <p className="text-slate-600 mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/" className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-medium"
          >
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-slate-200/60">
          <p className="text-sm text-slate-500 mb-4">Try one of these:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/news"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              News
            </Link>
            <Link
              href="/help"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Help
            </Link>
            <Link
              href="/faq"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
