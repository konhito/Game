"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/auth-service";
import config from "@/lib/config";

interface InstagramAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function InstagramAuthButton({
  onSuccess,
  onError,
  isLoading = false,
  disabled = false,
  children,
  className = "",
}: InstagramAuthButtonProps) {
  const isFacebookLoaded = useRef(false);

  useEffect(() => {
    // Load Facebook SDK script
    const loadFacebookScript = () => {
      if (window.FB || isFacebookLoaded.current) return;

      // Create fbAsyncInit function
      window.fbAsyncInit = () => {
        const facebookAppId = config.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        
        if (!facebookAppId) {
          console.error("Facebook App ID not configured");
          onError?.("Instagram OAuth not configured");
          return;
        }

        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });

        console.log("Facebook SDK initialized");
        isFacebookLoaded.current = true;
      };

      // Load the SDK script
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        console.log("Facebook SDK script loaded");
      };
      script.onerror = () => {
        console.error("Failed to load Facebook SDK");
        onError?.("Failed to load Facebook SDK");
      };
      document.head.appendChild(script);
    };

    loadFacebookScript();

    // Cleanup
    return () => {
      // Cleanup if needed
    };
  }, [onError]);

  const handleInstagramLogin = async () => {
    try {
      if (!window.FB) {
        throw new Error("Facebook SDK not loaded");
      }

      const currentUser = authService.getUser();
      if (currentUser) {
        console.log("User already logged in, clearing session first:", currentUser.email);
        authService.logout();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Login with Facebook (which supports Instagram)
      window.FB.login(
        (response: any) => {
          console.log("Facebook login response:", response);

          if (response.authResponse) {
            // Get user info
            window.FB.api("/me", { fields: "id,name,email,picture" }, async (userResponse: any) => {
              console.log("Facebook user info:", userResponse);

              try {
                // Try to get Instagram account info if available
                // Note: Instagram Basic Display API requires separate setup
                // For now, we'll use Facebook user data which works for Instagram-connected accounts
                const instagramUser = {
                  id: userResponse.id,
                  name: userResponse.name || "Instagram User",
                  email: userResponse.email || `instagram_${userResponse.id}@facebook.com`,
                  picture: userResponse.picture?.data?.url || userResponse.picture,
                };

                console.log("Processing Instagram authentication for user:", instagramUser.email);

                // Handle the Instagram authentication
                await authService.handleInstagramAuth(instagramUser);

                // Verify authentication was successful
                const isAuthenticated = authService.isAuthenticated();
                const user = authService.getUser();
                const token = authService.getToken();

                console.log("Post-auth verification:", {
                  isAuthenticated,
                  hasUser: !!user,
                  hasToken: !!token,
                  userEmail: user?.email,
                });

                if (!isAuthenticated) {
                  throw new Error("Authentication failed after Instagram OAuth");
                }

                console.log("Instagram authentication successful - calling onSuccess");
                onSuccess?.();
              } catch (error: any) {
                console.error("Error handling Instagram response:", error);
                onError?.(error.message || "Instagram authentication failed");
              }
            });
          } else {
            console.error("Facebook login failed:", response);
            onError?.("Instagram login was cancelled or failed");
          }
        },
        {
          scope: "email,public_profile",
          return_scopes: true,
        }
      );
    } catch (error: any) {
      console.error("Error initiating Instagram login:", error);
      onError?.(error.message || "Failed to initiate Instagram login");
    }
  };

  const facebookAppId = config.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  if (!facebookAppId) {
    return (
      <Button
        disabled
        className={`w-full border-slate-200 text-slate-700 ${className}`}
      >
        Instagram OAuth not configured
      </Button>
    );
  }

  return (
    <Button
      onClick={handleInstagramLogin}
      disabled={isLoading || disabled || !isFacebookLoaded.current}
      className={`w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white font-semibold ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Signing in...
        </>
      ) : (
        children || (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.401 2.013 9.756 2 12.315 2zm0-2a79.456 79.456 0 00-4.621.06C5.668.11 4.684.306 3.76.59 2.661.966 1.772 1.576.841 2.507-.09 3.438-.7 4.327-1.076 5.426c-.284.924-.48 1.908-.53 2.934A79.46 79.46 0 00-2 11.684v.632c0 2.43.013 2.784.06 3.808.05 1.026.246 2.01.53 2.934.376 1.099.986 1.988 1.917 2.919.93.93 1.82 1.541 2.919 1.917.924.284 1.908.48 2.934.53 1.024.047 1.378.06 3.808.06h.632c2.43 0 2.784-.013 3.808-.06 1.026-.05 2.01-.246 2.934-.53 1.099-.376 1.988-.986 2.919-1.917.93-.93 1.541-1.82 1.917-2.919.284-.924.48-1.908.53-2.934A79.46 79.46 0 0022 12.316v-.632c0-2.43-.013-2.784-.06-3.808-.05-1.026-.246-2.01-.53-2.934-.376-1.099-.986-1.988-1.917-2.919-.93-.93-1.82-1.541-2.919-1.917-.924-.284-1.908-.48-2.934-.53C15.089.013 14.735 0 12.315 0h-.632z" />
              <path d="M12.315 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12.315 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Continue with Instagram
          </>
        )
      )}
    </Button>
  );
}

