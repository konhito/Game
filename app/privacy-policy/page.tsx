import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Privacy Policy — Pinecrest
            </h1>
            <p className="text-sm text-slate-600 mb-8">
              Effective Date: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  1) Scope
                </h2>
                <p className="leading-relaxed">
                  This Policy explains how we collect, use, disclose, and protect personal data when you use
                  Pinecrest websites, apps, leaderboards, rewards, advertiser campaigns, referral programs, and
                  support channels (collectively, the &quot;Services&quot;).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  2) Who this applies to
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Users/Players earning points and prizes.</li>
                  <li>Advertisers/Partners running campaigns.</li>
                  <li>Visitors to pinecrest247.com.</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  <strong>Minimum age:</strong> 13+ (or higher where local law requires; e.g., 16 in the EEA). If you are under the
                  minimum age, do not use the Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  3) Personal data we collect
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account data</h3>
                    <p className="leading-relaxed">
                      Name, username, email, phone, password hash, date of birth, gender (optional), city/country, avatar.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Auth data</h3>
                    <p className="leading-relaxed">
                      Google OAuth ID, email verification tokens, 2FA secrets.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Engagement data</h3>
                    <p className="leading-relaxed">
                      Spins, tasks completed, shares, likes/comments (as verified), referral codes, leaderboard points, streaks, badges.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Device & usage data</h3>
                    <p className="leading-relaxed">
                      IP address, device identifiers, browser type, OS, pages viewed, session duration, crash logs, referral URLs.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Location data</h3>
                    <p className="leading-relaxed">
                      Coarse location (country/city) from IP; precise location only if you opt in.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Marketing preferences</h3>
                    <p className="leading-relaxed">
                      Notifications, email/SMS opt-ins.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">KYC/Payments</h3>
                    <p className="leading-relaxed">
                      (If you cash out or reach thresholds): name on ID, government ID number, selfie/biometric verification (if required by law/anti-fraud), payment wallet/bank details, tax IDs where required.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Advertiser data</h3>
                    <p className="leading-relaxed">
                      Brand details, billing contact, campaign settings, creatives, invoices, payment history.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">User-generated content (UGC)</h3>
                    <p className="leading-relaxed">
                      Posts, comments, handles, screenshots or links you submit to prove engagement (if applicable).
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Support data</h3>
                    <p className="leading-relaxed">
                      Messages, call/chat recordings.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  4) Sources of data
                </h2>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You (forms, uploads, actions).</li>
                  <li>Auth providers (Google).</li>
                  <li>Social networks/APIs (when you connect/authorize verification).</li>
                  <li>Analytics/Anti-fraud vendors (device risk, bot detection).</li>
                  <li>Payment/KYC providers (identity and payout validation).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  5) Why we process data (purposes + legal bases)
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Provide the Services</strong> (create accounts, leaderboards, rewards) — Contract necessity.</li>
                  <li><strong>Verify shares/engagement</strong> via permitted signals, APIs, or proof uploads — Legitimate interests + Contract.</li>
                  <li><strong>Prevent fraud, bots, duplicate accounts, and abuse</strong> — Legitimate interests; where needed, Legal obligation.</li>
                  <li><strong>Run promotions and deliver prizes</strong> — Contract; Consent where required.</li>
                  <li><strong>Payments/KYC</strong> (when thresholds trigger) — Legal obligation; Contract.</li>
                  <li><strong>Personalize content & rankings</strong> — Legitimate interests; Consent where required.</li>
                  <li><strong>Marketing communications</strong> (email/SMS/push) — Consent or Legitimate interests with opt-out.</li>
                  <li><strong>Analytics & product improvement</strong> — Legitimate interests; Consent for cookies where required.</li>
                  <li><strong>Compliance</strong> (tax, AML/CFT) — Legal obligation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  6) Sharing your data
                </h2>
                <p className="leading-relaxed mb-3">We share with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service providers</strong> (hosting, email/SMS, analytics, fraud/KYC, payment, content moderation).</li>
                  <li><strong>Advertisers</strong> (aggregate, de-identified performance; no personal contact data unless you opt-in for direct brand rewards).</li>
                  <li><strong>Legal authorities</strong> when required by law or to protect rights/safety.</li>
                  <li><strong>Corporate transactions</strong> (merger, acquisition) with safeguards.</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  We do not sell personal data. We may share limited pseudonymous IDs with ad/analytics providers for measurement (subject to opt-out/consent rules).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  7) International transfers
                </h2>
                <p className="leading-relaxed">
                  Data may be processed outside your country (e.g., EU/UK/US/Nigeria). Where required, we use Standard Contractual Clauses or equivalent safeguards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  8) Retention
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account data:</strong> for the life of the account + up to 24 months after closure (for fraud/chargeback/legal).</li>
                  <li><strong>KYC/Payments:</strong> per legal/financial retention obligations (typically 5–7 years).</li>
                  <li><strong>Logs/analytics:</strong> 12–24 months, aggregated thereafter.</li>
                  <li><strong>Marketing preferences:</strong> until you opt-out or delete account.</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  We may retain minimal suppression records to honor opt-outs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  9) Your rights
                </h2>
                <p className="leading-relaxed">
                  Depending on your location (NDPR/GDPR/CCPA and others): access, rectification, deletion,
                  portability, restrict/object, withdraw consent, and lodge a complaint with your authority.
                </p>
                <p className="leading-relaxed mt-3">
                  <strong>Requests:</strong> <a href="mailto:privacy@pinecrest247.com" className="text-emerald-600 hover:underline">privacy@pinecrest247.com</a>. We may require ID verification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  10) Security
                </h2>
                <p className="leading-relaxed">
                  We use encryption in transit, access controls, 2FA options, rate limiting, anomaly detection, and
                  regular audits. No system is 100% secure; report issues to <a href="mailto:security@pinecrest247.com" className="text-emerald-600 hover:underline">security@pinecrest247.com</a> (PGP available on request).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  11) Children
                </h2>
                <p className="leading-relaxed">
                  We do not knowingly collect data from under-age users. Accounts discovered below minimum age will be deleted.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  12) Cookies & similar tech
                </h2>
                <p className="leading-relaxed">
                  We use essential, performance, analytics, and marketing cookies. Manage preferences in Cookie Settings and via your browser/OS. Where required, we obtain consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  13) Automated decision-making
                </h2>
                <p className="leading-relaxed">
                  We may use automated rules to detect fraud/bots and to allocate randomized rewards. You can request human review where legally required.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  14) Third-party links
                </h2>
                <p className="leading-relaxed">
                  Links to social platforms and advertiser sites have their own privacy policies. Review them before sharing data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  15) Changes
                </h2>
                <p className="leading-relaxed">
                  We&apos;ll post updates here and change the Effective Date. Material changes may be notified via email/in-app.
                </p>
              </section>

              <section className="pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  For questions or concerns, contact us at <a href="mailto:privacy@pinecrest247.com" className="text-emerald-600 hover:underline">privacy@pinecrest247.com</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
