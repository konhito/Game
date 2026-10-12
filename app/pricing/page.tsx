import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
        Join Pinecrest for free.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
        Create an account, complete available tasks, and track your points. There is no subscription to purchase to get started.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/sign-up" className="pine-button pine-button-dark">Create an account</Link>
        <Link href="/sign-in" className="pine-button pine-button-outline">Sign in</Link>
      </div>
    </main>
  );
}
