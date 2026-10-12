import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--pine)]">
              Terms of Service — Pinecrest
            </h1>
            <p className="text-sm text-slate-600 mb-8">
              Effective Date: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  1) Acceptance
                </h2>
                <p className="leading-relaxed">
                  By creating an account or using the Services, you agree to these Terms and our Privacy Policy. If
                  you do not agree, do not use the Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  2) Eligibility
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Minimum age: 13+ (or the age required by your jurisdiction).</li>
                  <li>One person → one account.</li>
                  <li>We may require KYC before prize redemption or at anti-fraud thresholds.</li>
                  <li>The Services are promotional and skill/engagement-based, not gambling. No user wagering is permitted.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  3) Accounts & security
                </h2>
                <p className="leading-relaxed">
                  You&apos;re responsible for your credentials and all activity under your account. Notify{" "}
                  <a href="/contact" className="text-emerald-600 hover:underline">Pinecrest support</a> of any breach. We may require 2FA.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  4) The Services
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Leaderboard & Points</h3>
                    <p className="leading-relaxed">
                      Points accrue from tasks (e.g., spins, shares, referrals, challenges).
                      Weekly leaderboards reset; we may publish winners&apos; usernames/avatars (you can opt for display name).
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Weekly top-3 rewards</h3>
                    <p className="leading-relaxed">
                      Weekly points determine rank placement; only top leaderboard positions receive PineCoin rewards.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Campaign tasks</h3>
                    <p className="leading-relaxed">
                      Some tasks require posting/sharing content on third-party platforms. You must comply with those platforms&apos; rules.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Verification</h3>
                    <p className="leading-relaxed">
                      We may verify engagement via APIs, telemetry, proof uploads, or signals (e.g., public post links). Verification methods may change.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Referrals</h3>
                    <p className="leading-relaxed">
                      Only real, consenting people. Self-referrals, phone-book spam, and fake/multiple accounts are prohibited.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Payouts/Prizes</h3>
                    <p className="leading-relaxed">
                      Airtime/data/vouchers/merch/other rewards as listed. Cash-outs may require KYC. Processing times can vary. Taxes are your responsibility unless required otherwise by law.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  5) Advertisers
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Content standards</h3>
                    <p className="leading-relaxed">
                      You warrant you have rights to all creatives and they are lawful, non-infringing, and compliant (no illegal, hateful, adult, deceptive, medical/financial claims without substantiation, or restricted goods).
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pricing & billing</h3>
                    <p className="leading-relaxed">
                      As per order form/IO. Late payments may incur interest and campaign pause.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Metrics & verification</h3>
                    <p className="leading-relaxed">
                      Pinecrest&apos;s anti-fraud/verification decisions are final for billing unless audit rights are expressly agreed in writing.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">License</h3>
                    <p className="leading-relaxed">
                      You grant Pinecrest a non-exclusive, worldwide license to use campaign materials to deliver, measure, and promote the campaign.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  6) User content (UGC)
                </h2>
                <p className="leading-relaxed">
                  You retain ownership of UGC and grant Pinecrest a royalty-free, worldwide license to host, display,
                  adapt, and promote it in connection with the Services. You warrant you have necessary rights and won&apos;t post unlawful or infringing content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  7) Prohibited conduct
                </h2>
                <p className="leading-relaxed mb-3">No:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bots, automated scripts, device farms, VPN farm abuse</li>
                  <li>Multiple accounts per person</li>
                  <li>False verification artifacts</li>
                  <li>Scraping, reverse engineering, interfering with the Service</li>
                  <li>Harassing others</li>
                  <li>Violating third-party platform policies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  8) Anti-fraud & enforcement
                </h2>
                <p className="leading-relaxed">
                  We may delay/withhold rewards, suspend or terminate accounts, adjust points, or disqualify entries
                  where manipulation or policy breaches are suspected. Appeals: <a href="mailto:compliance@pinecrest247.com" className="text-emerald-600 hover:underline">compliance@pinecrest247.com</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  9) Intellectual property
                </h2>
                <p className="leading-relaxed">
                  Pinecrest trademarks, logos, code, and content are owned by us or our licensors. Don&apos;t use them without written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  10) Changes to the Services
                </h2>
                <p className="leading-relaxed">
                  We may modify or discontinue features, campaigns, or rewards. Where material changes impact paid orders, we&apos;ll provide reasonable notice or refunds per contract.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  11) Disclaimers
                </h2>
                <p className="leading-relaxed">
                  Services are provided &quot;as is&quot;. We disclaim warranties of merchantability, fitness, non-infringement,
                  and uninterrupted availability. Social platforms may change APIs at any time; verification is provided on a best-effort basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  12) Limitation of liability
                </h2>
                <p className="leading-relaxed">
                  To the fullest extent permitted by law, Pinecrest is not liable for indirect, incidental, special,
                  consequential, or punitive damages, lost profits, lost data, or reputational harm.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  13) Indemnity
                </h2>
                <p className="leading-relaxed">
                  You agree to indemnify and hold Pinecrest harmless from claims arising out of your misuse,
                  unlawful content, violation of these Terms, or infringement of third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  14) Suspension & termination
                </h2>
                <p className="leading-relaxed">
                  We may suspend or terminate accounts for violations or risk. You may delete your account at any
                  time. Certain sections survive termination (IP, payments due, indemnity, liability limits, dispute resolution).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  15) Governing law & disputes
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    <strong>Governing law:</strong> Laws of the Federal Republic of Nigeria, without conflict-of-laws rules.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Venue:</strong> Competent courts in Lagos, Nigeria.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Arbitration (optional but recommended):</strong> Any dispute not resolved within 30 days shall
                    be finally settled by arbitration under the Lagos Court of Arbitration Rules, one arbitrator,
                    Lagos, English language. You waive class/representative actions to the extent permitted by law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  16) DMCA/Content complaints
                </h2>
                <p className="leading-relaxed">
                  For copyright complaints, email <a href="mailto:dmca@pinecrest247.com" className="text-emerald-600 hover:underline">dmca@pinecrest247.com</a> with: your contact, work claimed,
                  infringing URL, statement of good faith, and a sworn statement that information is accurate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  17) Third-party services
                </h2>
                <p className="leading-relaxed">
                  Facebook, Instagram, TikTok, X/Twitter, YouTube, WhatsApp and others are third parties with their
                  own terms. Pinecrest is not responsible for their availability or changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  18) Changes to Terms
                </h2>
                <p className="leading-relaxed">
                  We&apos;ll post updates with an Effective Date and notify materially where appropriate. Continued use means acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                  19) Contact
                </h2>
                <p className="leading-relaxed">
                  <a href="/contact" className="text-emerald-600 hover:underline">Contact Pinecrest support</a>
                </p>
              </section>

              <section className="pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  By using Pinecrest, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
