"use client";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { authService } from "@/lib/auth-service";

export default function ManageSubscription() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          // TODO: Implement subscription management
          console.log("Subscription management not implemented yet");
        } catch (error) {
          console.error("Failed to open customer portal:", error);
        }
      }}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Manage Subscription
    </Button>
  );
}
