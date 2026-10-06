"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/auth-service";
import config from "@/lib/config";

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  referralCode?: string;
  children?: React.ReactNode;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  isLoading = false,
  disabled = false,
  referralCode,
  children,
  className = "",
}: GoogleAuthButtonProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isGoogleLoaded = useRef(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      // The script stays in the document across Next.js client-side navigations,
      // while this button's container is recreated. Re-initialize it so Google
      // renders into the newly mounted container.
      if (window.google) {
        isGoogleLoaded.current = true;
        initializeGoogleAuth();
        return;
      }

      if (isGoogleLoaded.current) return;

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        isGoogleLoaded.current = true;
        initializeGoogleAuth();
      };
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      console.log("Initializing Google Auth...");
      console.log("Google object:", window.google);
      console.log("Config GOOGLE_CLIENT_ID:", config.GOOGLE_CLIENT_ID);
      console.log("Environment NEXT_PUBLIC_GOOGLE_CLIENT_ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
      
      // Hardcoded Google Client ID as fallback
      const googleClientId = config.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "969315225443-6s71jgef0skd6u3bknouj255tui4b97c.apps.googleusercontent.com";
      
      if (!window.google || !googleClientId) {
        console.error("Google OAuth not configured properly");
        console.error("Window.google:", !!window.google);
        console.error("Google Client ID:", googleClientId);
        onError?.("Google OAuth not configured");
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "rectangular",
          });
        }
      } catch (error) {
        console.error("Error initializing Google Auth:", error);
        onError?.("Failed to initialize Google authentication");
      }
    };

    const handleGoogleResponse = async (response: any) => {
      try {
        if (!response.credential) throw new Error("Google did not return an ID token");
        
        // Check if there's already a logged-in user
        const currentUser = authService.getUser();
        if (currentUser) {
          console.log("User already logged in, clearing session first:", currentUser.email);
          authService.logout();
          // Wait for cleanup to complete
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        await authService.handleGoogleAuth(response.credential, referralCode);
        
        // Verify authentication was successful
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getUser();
        const token = authService.getToken();
        
        console.log("Post-auth verification:", {
          isAuthenticated,
          hasUser: !!user,
          hasToken: !!token,
          userEmail: user?.email
        });
        
        if (!isAuthenticated) {
          throw new Error("Authentication failed after Google OAuth");
        }
        
        console.log("Google authentication successful - calling onSuccess");
        onSuccess?.();
      } catch (error) {
        console.error("Error handling Google response:", error);
        onError?.(error instanceof Error ? error.message : "Google authentication failed");
      }
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.log("Error cleaning up Google Auth:", error);
        }
      }
    };
  }, [onSuccess, onError, referralCode]);

  const googleClientId = config.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "969315225443-6s71jgef0skd6u3bknouj255tui4b97c.apps.googleusercontent.com";
  
  if (!googleClientId) {
    return (
      <Button
        disabled
        className={`w-full border-slate-200 text-slate-700 ${className}`}
      >
        Google OAuth not configured
      </Button>
    );
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <Button
          disabled
          className={`w-full border-slate-200 text-slate-700 ${className}`}
        >
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Signing in...
        </Button>
      ) : (
        <div ref={googleButtonRef} className="w-full" />
      )}
    </div>
  );
}
