"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoogleAuthButton from "@/components/google-auth-button";
import { authService } from "@/lib/auth-service";
import config from "@/lib/config";
import { CheckCircle, XCircle, AlertCircle, User, Mail, Calendar } from "lucide-react";

export default function TestGoogleAuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [configStatus, setConfigStatus] = useState({
    hasClientId: false,
    hasApiBase: false,
    hasAppUrl: false,
  });

  useEffect(() => {
    // Check configuration
    setConfigStatus({
      hasClientId: !!config.GOOGLE_CLIENT_ID,
      hasApiBase: !!config.API_BASE,
      hasAppUrl: !!config.APP_URL,
    });

    // Check authentication status
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const userData = authService.getUser();
      
      setIsAuthenticated(authenticated);
      setUser(userData);
    };

    checkAuth();

    // Listen for auth changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleSuccess = () => {
    console.log("Google OAuth success callback triggered");
    // The useEffect will pick up the auth state change
  };

  const handleGoogleError = (error: string) => {
    console.error("Google OAuth error:", error);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const isConfigValid = configStatus.hasClientId && configStatus.hasApiBase && configStatus.hasAppUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Google OAuth Test Page
          </h1>
          <p className="text-slate-600 text-lg">
            Test and verify Google OAuth authentication setup
          </p>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Configuration Status
            </CardTitle>
            <CardDescription>
              Check if all required environment variables are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Google Client ID</span>
                <Badge variant={configStatus.hasClientId ? "default" : "destructive"}>
                  {configStatus.hasClientId ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {configStatus.hasClientId ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>API Base URL</span>
                <Badge variant={configStatus.hasApiBase ? "default" : "destructive"}>
                  {configStatus.hasApiBase ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {configStatus.hasApiBase ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>App URL</span>
                <Badge variant={configStatus.hasAppUrl ? "default" : "destructive"}>
                  {configStatus.hasAppUrl ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {configStatus.hasAppUrl ? "Configured" : "Missing"}
                </Badge>
              </div>
            </div>
            
            {!isConfigValid && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  Please configure the missing environment variables. See the setup guide for details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Authentication Status
            </CardTitle>
            <CardDescription>
              Current authentication state and user information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Authentication Status</span>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>

              {user && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-2">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">Name:</span>
                      <span>{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">Created:</span>
                      <span>{new Date(user.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role:</span>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Auth Type:</span>
                      <Badge variant="outline">
                        {authService.isGoogleUser() ? "Google OAuth" : "Email/Password"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google OAuth Test */}
        <Card>
          <CardHeader>
            <CardTitle>Google OAuth Test</CardTitle>
            <CardDescription>
              Test the Google OAuth authentication flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <p className="text-slate-600">
                    Click the button below to test Google OAuth authentication:
                  </p>
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    className="max-w-md"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-green-600 font-medium">
                    ✅ Successfully authenticated with Google OAuth!
                  </p>
                  <Button onClick={handleLogout} variant="outline">
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Details */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Details</CardTitle>
            <CardDescription>
              Current configuration values (for debugging)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono bg-slate-100 p-4 rounded-lg">
              <div><strong>GOOGLE_CLIENT_ID:</strong> {config.GOOGLE_CLIENT_ID || "Not set"}</div>
              <div><strong>API_BASE:</strong> {config.API_BASE}</div>
              <div><strong>APP_URL:</strong> {config.APP_URL}</div>
              <div><strong>APP_NAME:</strong> {config.APP_NAME}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
