import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Target, Users, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
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

        <Card className="shadow-xl border-0">
          <CardContent className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              About PineCrest
            </h1>
            <p className="text-lg text-slate-600 mb-12">
              Weekly points competition with top-3 PineCoin rewards
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
                  <Target className="h-6 w-6 text-emerald-600" />
                  Our Mission
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  PineCrest is a gamified platform where users earn weekly points from social activities and compete for the top 3 spots.
                  Weekly points reset every Monday, and the top performers receive PineCoins.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-emerald-600" />
                  What We Do
                </h2>
                <div className="space-y-4 text-slate-700">
                  <p>
                    PineCrest connects users with engaging social media tasks from brands and creators. Complete tasks like 
                    liking posts, sharing content, following accounts, and watching videos to earn weekly points.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Complete verified social media tasks</li>
                    <li>Earn weekly points for each activity</li>
                    <li>Compete for top-3 leaderboard positions every week</li>
                    <li>Receive PineCoins when you finish in the weekly top 3</li>
                    <li>Track your progress and achievements</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
                  <Award className="h-6 w-6 text-emerald-600" />
                  Why Choose PineCrest
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Verified Tasks</h3>
                    <p className="text-sm text-slate-700">
                      All tasks are verified using AI technology to ensure authenticity and prevent fraud.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Real Rewards</h3>
                    <p className="text-sm text-slate-700">
                      Top 3 weekly performers receive PineCoins and can request withdrawals.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Fair Competition</h3>
                    <p className="text-sm text-slate-700">
                      Weekly leaderboards reset fairly, giving everyone a chance to compete and win.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Secure Platform</h3>
                    <p className="text-sm text-slate-700">
                      Your data and earnings are protected with industry-standard security measures.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  Our Values
                </h2>
                <div className="space-y-4 text-slate-700">
                  <p>
                    At PineCrest, we're committed to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Transparency:</strong> Clear rules, fair rewards, and honest communication</li>
                    <li><strong>Innovation:</strong> Constantly improving our platform with new features and opportunities</li>
                    <li><strong>Community:</strong> Building a supportive community of engaged users</li>
                    <li><strong>Integrity:</strong> Ensuring all tasks are legitimate and verified</li>
                    <li><strong>Reward:</strong> Making sure your efforts are properly compensated</li>
                  </ul>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-200">
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  Get Started Today
                </h2>
                <p className="text-slate-700 mb-6">
                  Join PineCrest and start earning weekly points from your social media activities.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Your Account
                </Link>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


