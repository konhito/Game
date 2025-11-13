"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/lib/auth-service";
import { Settings2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  image?: string | null;
}

function SettingsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("profile");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Profile form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Profile picture upload states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "billing"].includes(tab)) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user from auth service
        const currentUser = authService.getUser();
        if (currentUser) {
          setUser(currentUser);
          setName(currentUser.name || "");
          setEmail(currentUser.email || "");
        } else {
          // If no user found, redirect to login
          router.push("/sign-in");
          return;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleUpdateProfile = async () => {
    try {
      const result = await authService.updateProfile({ name });
      setUser(result.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profileImage) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", profileImage);

      // Upload to your R2 storage endpoint
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();

        // Update user profile with new image URL
        const result = await authService.updateProfile({
          name,
          image: url,
        });

        setUser(result.user);
        setImagePreview(null);
        setProfileImage(null);
        toast.success("Profile picture updated successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-32 mb-2 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-5 w-80 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Tabs Skeleton */}
        <div className="w-full max-w-4xl">
          <div className="flex space-x-1 mb-6">
            <Skeleton className="h-10 w-20 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="h-10 w-16 bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="space-y-6">
            {/* Profile Information Card Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-800" />
                </div>
                <Skeleton className="h-4 w-72 bg-gray-200 dark:bg-gray-800" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-8 w-12 bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-8 w-16 bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>

                <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-800" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full max-w-4xl"
      >
        <TabsList className="transition-all duration-300">
          <TabsTrigger 
            value="profile"
            className="transition-all duration-300 hover:scale-105 data-[state=active]:scale-105"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="transition-all duration-300 hover:scale-105 data-[state=active]:scale-105"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={imagePreview || user?.image || ""} />
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("profile-image-input")?.click()
                      }
                      disabled={uploadingImage}
                      className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                    >
                      {uploadingImage ? "Uploading..." : "Change Photo"}
                    </Button>
                    {profileImage && (
                      <Button
                        size="sm"
                        onClick={handleUploadProfilePicture}
                        disabled={uploadingImage}
                        className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                      >
                        Save
                      </Button>
                    )}
                    {imagePreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setProfileImage(null);
                        }}
                        className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
              </div>

              <Button 
                onClick={handleUpdateProfile}
                className="transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="space-y-4 mt-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Billing Information</h3>
                <p className="text-sm text-muted-foreground">
                  Billing functionality is not yet implemented
                </p>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    className="h-10 w-10 text-muted-foreground mb-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold">
                    Billing Coming Soon
                  </h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Billing and subscription management features are currently under development.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6">
          <div>
            <div className="h-9 w-32 mb-2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
            <div className="h-5 w-80 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
