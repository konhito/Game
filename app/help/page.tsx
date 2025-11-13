import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Book, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: Book,
      topics: [
        "How to create an account",
        "How to complete your first task",
        "Understanding points and PineCoins",
        "Setting up your profile",
      ],
    },
    {
      title: "Earning Rewards",
      icon: HelpCircle,
      topics: [
        "How to complete tasks",
        "Submitting proof for tasks",
        "Understanding task verification",
        "How to earn more points",
      ],
    },
    {
      title: "Account & Settings",
      icon: MessageCircle,
      topics: [
        "Updating your profile",
        "Changing your password",
        "Account security",
        "Privacy settings",
      ],
    },
  ];

  const faqItems = [
    {
      question: "How do I earn PineCoins?",
      answer: "You earn PineCoins by completing social media tasks. Each task has a reward amount in points and PineCoins. Complete tasks, submit proof, and get verified to earn rewards.",
    },
    {
      question: "How long does task verification take?",
      answer: "Most tasks are verified automatically using AI technology within minutes. Some tasks may require manual review, which typically takes 24-48 hours.",
    },
    {
      question: "Can I withdraw my PineCoins?",
      answer: "Yes! You can redeem PineCoins for various rewards including gift cards, cash, and prizes. Check the rewards section in your dashboard for available options.",
    },
    {
      question: "What happens to my weekly points?",
      answer: "Weekly points reset every Monday at midnight UTC. Your PineCoins and lifetime points are preserved - only weekly points reset for fair competition.",
    },
    {
      question: "How do I contact support?",
      answer: "You can contact our support team through the contact page, or email us at support@pinecrest.com. We typically respond within 24-48 hours.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
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
            Help Center
          </h1>
          <p className="text-lg text-slate-600">
            Find answers to common questions and learn how to get the most out of PineCrest
          </p>
        </div>

        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-slate-600 text-sm">
                        • {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
              <p className="text-slate-600 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button asChild className="bg-gradient-to-r from-emerald-600 to-blue-600">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

