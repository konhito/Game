"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign Up' button in the header or footer, fill in your details, and verify your email. You can also sign up using Google OAuth for faster registration.",
        },
        {
          q: "Is PineCrest free to use?",
          a: "Yes! Creating an account and using PineCrest is completely free. You only earn rewards - there are no fees or charges.",
        },
        {
          q: "How do I start earning rewards?",
          a: "Once you're logged in, go to the Activities page to see available tasks. Start a task, complete the requirements, submit proof, and get verified to earn points and PineCoins.",
        },
      ],
    },
    {
      category: "Tasks & Verification",
      questions: [
        {
          q: "How do I complete a task?",
          a: "1. Browse available tasks on the Activities page. 2. Click 'Start Task' to begin. 3. Complete the task requirements (like, share, follow, etc.). 4. Submit proof (screenshot or description). 5. Wait for verification. Once approved, you'll receive your rewards!",
        },
        {
          q: "What kind of proof do I need to submit?",
          a: "Most tasks require a screenshot showing you completed the action. For example, a screenshot of a liked post, shared content, or your follow. Make sure the screenshot is clear and shows the required action.",
        },
        {
          q: "How long does verification take?",
          a: "Most tasks are verified automatically using AI within minutes. Some tasks may require manual review, which typically takes 24-48 hours. You'll be notified once your task is verified.",
        },
        {
          q: "What if my task is rejected?",
          a: "If your task is rejected, you'll receive a reason. You can restart the task and submit new proof. Make sure to carefully follow all task requirements.",
        },
      ],
    },
    {
      category: "Points & Rewards",
      questions: [
        {
          q: "What are PineCoins?",
          a: "PineCoins are the virtual currency on PineCrest. You earn PineCoins by completing tasks, and you can redeem them for real rewards like gift cards, cash, and prizes.",
        },
        {
          q: "What's the difference between points and PineCoins?",
          a: "Points are used for leaderboard rankings and achievements. PineCoins are the currency you can redeem for rewards. Both are earned by completing tasks.",
        },
        {
          q: "How do I redeem my PineCoins?",
          a: "Go to the Rewards section in your dashboard to see available redemption options. Select the reward you want and follow the redemption process.",
        },
        {
          q: "Do weekly points reset?",
          a: "Yes, weekly points reset every Monday at midnight UTC. This ensures fair competition on the leaderboard. Your PineCoins and lifetime points are never reset - only weekly points.",
        },
      ],
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I change my password?",
          a: "Go to Settings in your dashboard, then click on 'Change Password'. Enter your current password and your new password twice.",
        },
        {
          q: "What if I forget my password?",
          a: "Click 'Forgot Password' on the sign-in page. Enter your email, and we'll send you a reset link.",
        },
        {
          q: "Is my data secure?",
          a: "Yes! We use industry-standard security measures to protect your data. Your password is encrypted, and we never share your personal information with third parties.",
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account from the Settings page. Note that this action is permanent and will remove all your data, points, and PineCoins.",
        },
      ],
    },
    {
      category: "Leaderboard & Competition",
      questions: [
        {
          q: "How does the leaderboard work?",
          a: "The leaderboard ranks users by their total points. Weekly points reset every Monday, but lifetime points continue to accumulate. Top performers can win additional rewards!",
        },
        {
          q: "When does the leaderboard reset?",
          a: "Weekly points reset every Monday at midnight UTC. This gives everyone a fresh start each week for fair competition.",
        },
        {
          q: "Are there prizes for top leaderboard positions?",
          a: "Yes! Top performers on the weekly leaderboard can win bonus PineCoins and special rewards. Check the leaderboard page for current prizes.",
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
            Everything you need to know about PineCrest
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
                            <p className="text-slate-700 leading-relaxed">{faq.a}</p>
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
              Can't find the answer you're looking for? Our support team is ready to help.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Contact Support
              </Link>
              <Link
                href="/help"
                className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Visit Help Center
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


