"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "About Pinecrest",
      questions: [
        {
          q: "What is Pinecrest?",
          a: "A gamified promotions platform where users complete tasks—like sharing brand posts, referrals, daily spins, and challenges—to earn Pinecoins and win weekly prizes on a public leaderboard.",
        },
        {
          q: "Is this gambling?",
          a: "No. Users do not wager money. Rewards are tied to tasks/skill/engagement and randomized bonuses. Pinecrest is a promotional platform.",
        },
        {
          q: "Who can join?",
          a: "Anyone 13+ (or the legal minimum in your region). Some rewards may be country-specific due to sponsor or legal constraints.",
        },
      ],
    },
    {
      category: "Earning Points",
      questions: [
        {
          q: "How do I earn points?",
          a: "• Daily spins, challenges, streaks.\n• Verified sharing/engagement on supported social platforms.\n• Referrals of real friends.\n• Sponsored tasks from advertisers.",
        },
        {
          q: "How is sharing verified?",
          a: "We use a mix of API checks (where permitted), telemetry (e.g., reachable post URLs, timestamps, public visibility), proof uploads, callback webhooks or SDK signals, and fraud-risk scoring. If a share is deleted rapidly, set to private, or flagged by our anti-fraud systems, points may be withheld.",
        },
        {
          q: "How often does the leaderboard reset?",
          a: "Weekly. Winners are announced in-app and via email.",
        },
      ],
    },
    {
      category: "Rewards & Redemption",
      questions: [
        {
          q: "What can I redeem?",
          a: "Airtime/data, vouchers, gift cards, merchandise, event tickets, and occasional cash equivalents where permitted. Some redemptions require KYC and may be subject to tax reporting.",
        },
        {
          q: "When is KYC required?",
          a: "If your cumulative rewards exceed ₦100,000 or for certain prize types (cash equivalents), we'll request ID verification to comply with AML/CFT, fraud prevention, and sponsor rules.",
        },
        {
          q: "Why were my points removed or my prize delayed?",
          a: "Likely due to failed verification (e.g., private/deleted share), suspected bot activity, duplicate accounts, or policy violations. See Anti-fraud & Enforcement. You can appeal via support.",
        },
      ],
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "Can I use multiple accounts?",
          a: "No. One account per person. Multi-accounting leads to disqualification and forfeiture of rewards.",
        },
        {
          q: "Are there daily limits?",
          a: "Yes. To keep things fair, we cap spins, shares, and referral credit per day. Limits are shown in-app and may change during anti-fraud events.",
        },
        {
          q: "How do I delete my account or data?",
          a: "In Settings → Privacy, request deletion. We'll confirm via email. Some records may be retained for legal/fraud reasons (see Privacy Policy).",
        },
        {
          q: "How do you handle my data?",
          a: "We follow NDPR/GDPR/CCPA-style principles. See our Privacy Policy for rights, transfers, and retention. Contact privacy@pinecrest247.com for requests.",
        },
      ],
    },
    {
      category: "For Advertisers",
      questions: [
        {
          q: "Can brands advertise on Pinecrest?",
          a: "Yes. Contact info@pinecrest247.com or ads@pinecrest247.com. We offer pay-per-engagement, fixed campaign packages, and campus/geo targeting with real-time dashboards.",
        },
        {
          q: "How much does advertising cost?",
          a: "Packages start at ₦100,000. Pay-per-engagement (shares, comments, saves) also available. We'll recommend the most cost-effective mix for your goals.",
        },
        {
          q: "Will Pinecrest post on my social accounts?",
          a: "Only if you explicitly grant permission. Most tasks require you to share content yourself.",
        },
      ],
    },
    {
      category: "Age & Taxes",
      questions: [
        {
          q: "I'm under 18. Can I win?",
          a: "Yes, subject to your country's laws and sponsor restrictions. Some prizes require a parent/guardian for delivery.",
        },
        {
          q: "Taxes on prizes?",
          a: "Local tax laws vary. You are responsible for any taxes unless stated otherwise in a campaign's rules.",
        },
      ],
    },
    {
      category: "Support & Reporting",
      questions: [
        {
          q: "Reporting a bug or vulnerability?",
          a: "Email info@pinecrest247.com (PGP available). We appreciate responsible disclosure.",
        },
        {
          q: "Contact support",
          a: "support@pinecrest247.com | In-app chat | @pinecrest247 (social)",
        },
      ],
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600">
            Everything you need to know about Pinecrest
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-xl border-0">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const currentIndex = questionIndex++;
                    const isOpen = openIndex === currentIndex;
                    return (
                      <div
                        key={qIndex}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(currentIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-slate-600 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our support team is ready to help.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="mailto:support@pinecrest247.com"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
              <Link
                href="/privacy"
                className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

