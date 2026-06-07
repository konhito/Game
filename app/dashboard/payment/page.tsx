import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubscriptionDetails } from "@/lib/subscription";
import Link from "next/link";
import ManageSubscription from "./_components/manage-subscription";

export default async function PaymentPage() {
  const subscriptionDetails = await getSubscriptionDetails();

  return (
    <div className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="relative min-h-[60svh]">
          {!subscriptionDetails.hasSubscription ||
          subscriptionDetails.subscription?.status !== "active" ? (
            <>
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg px-4">
                <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-900 sm:p-8">
                  <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                    Subscription Required
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground sm:text-base">
                    You need an active subscription to access payment management
                    features.
                  </p>
                  <Link href="/pricing">
                    <Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95">
                      Subscribe Now
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="blur-sm pointer-events-none">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>
                      Manage your billing and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Current Plan
                        </p>
                        <p className="text-md">Pro Plan</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Billing Status
                        </p>
                        <p className="text-md">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>
                  Your current subscription information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Status
                    </p>
                    <p className="text-md capitalize">
                      {subscriptionDetails.subscription.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Amount
                    </p>
                    <p className="text-md">
                      {subscriptionDetails.subscription.amount / 100}{" "}
                      {subscriptionDetails.subscription.currency.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Billing Interval
                    </p>
                    <p className="text-md capitalize">
                      {subscriptionDetails.subscription.recurringInterval}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Current Period End
                    </p>
                    <p className="text-md">
                      {new Date(
                        subscriptionDetails.subscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {subscriptionDetails.subscription.cancelAtPeriodEnd && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will cancel at the end of the current
                      billing period.
                    </p>
                  </div>
                )}
                <ManageSubscription />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
