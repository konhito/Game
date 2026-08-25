"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { title: "Explore", links: [["Leaderboard", "/leaderboard"], ["News", "/news"], ["Community", "/community"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Help", "/help"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["FAQ", "/faq"]] },
];

export default function SharedFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname?.startsWith("/dashboard")) return null;

  return (
    <footer className="bg-[var(--forest)] px-6 py-12 text-[var(--paper)] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-[var(--paper)]/15 pb-12 md:grid-cols-[1.3fr_2fr]">
          <div><Link href="/" className="flex items-center gap-3"><img src="/Icon.png" alt="" className="h-9 w-7 object-contain" /><span className="text-xl font-semibold tracking-[-.04em]">Pinecrest<span className="text-[var(--lime)]">.</span></span></Link><p className="mt-5 max-w-sm text-sm leading-7 text-[var(--paper)]/55">Small actions. Clear progress. A fairer way to earn from showing up online.</p></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><p className="eyebrow text-[var(--lime)]">{group.title}</p><ul className="mt-4 space-y-3 text-sm text-[var(--paper)]/60">{group.links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-[var(--paper)]">{label}</Link></li>)}</ul></div>)}</div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-xs uppercase tracking-[.14em] text-[var(--paper)]/35 sm:flex-row"><span>© {new Date().getFullYear()} Pinecrest</span><span>Make the everyday count.</span></div>
      </div>
    </footer>
  );
}
