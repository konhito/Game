import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Users, Trophy, MessageSquare, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
  const features = [
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of users earning rewards and sharing tips",
    },
    {
      icon: Trophy,
      title: "Weekly Competitions",
      description: "Compete on leaderboards and win bonus rewards",
    },
    {
      icon: MessageSquare,
      title: "Share & Learn",
      description: "Connect with other users and learn winning strategies",
    },
    {
      icon: TrendingUp,
      title: "Growth Together",
      description: "Watch the community grow and earn together",
    },
  ];

  const topUsers = [
    { rank: 1, name: "Alex M.", points: 12500, coins: 2500 },
    { rank: 2, name: "Sarah K.", points: 11800, coins: 2300 },
    { rank: 3, name: "Mike T.", points: 11200, coins: 2100 },
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
            PineCrest Community
          </h1>
          <p className="text-lg text-slate-600">
            Join a vibrant community of users earning rewards together
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold">Top Performers</h2>
              </div>
              <div className="space-y-4">
                {topUsers.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          user.rank === 1
                            ? "bg-yellow-500"
                            : user.rank === 2
                            ? "bg-slate-400"
                            : "bg-amber-600"
                        }`}
                      >
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-slate-600">
                          {user.points.toLocaleString()} points
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {user.coins.toLocaleString()} coins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-blue-600">
                <Link href="/dashboard/leaderboard">View Full Leaderboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Community Guidelines</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h3 className="font-semibold mb-2">Be Respectful</h3>
                  <p className="text-sm">
                    Treat all community members with respect and kindness. We're all here to earn
                    rewards together.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Share Legitimately</h3>
                  <p className="text-sm">
                    Only share legitimate tips and strategies. Don't promote cheating or fraudulent
                    activities.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Help Others</h3>
                  <p className="text-sm">
                    Share your knowledge and help newcomers learn the ropes. A strong community
                    benefits everyone.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Follow Rules</h3>
                  <p className="text-sm">
                    Adhere to our terms of service and community guidelines. Violations may result in
                    account restrictions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Join the Community?</h3>
            <p className="text-slate-600 mb-6">
              Start earning rewards today and connect with other PineCrest users!
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-gradient-to-r from-emerald-600 to-blue-600">
                <Link href="/sign-up">Create Account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

