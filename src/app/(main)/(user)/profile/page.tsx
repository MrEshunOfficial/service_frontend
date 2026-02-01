"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCompleteProfile } from "@/hooks/profiles/userProfile.hook";
import { useProviderProfile } from "@/hooks/profiles/useProviderProfile";
import { UserRole, PopulationLevel } from "@/types/base.types";
import {
  Home,
  ServerCrash,
  AlertCircle,
  RefreshCw,
  UserX,
  UserPlus,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import {
  useClientProfile,
  useCompleteClientProfile,
} from "@/hooks/profiles/useClientProfile";
import { ClientProfileDisplay } from "@/components/profiles/client/ClientProfielDashboard";
import { Card, CardContent } from "@/components/ui/card";
import ProviderDashboard from "@/components/profiles/provider/dashboard-ui/bussiness.profile";
import { ClientProfileEmptyState } from "@/components/profiles/client/ClientEmptyState";
import { ProviderProfileEmptyState } from "@/components/profiles/client/ProviderProfileEmptyState";

interface ErrorConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showErrorDetails?: boolean;
}

/* ======================================================
   Shared Error UI
====================================================== */

function ErrorStateDisplay({
  config,
  error,
}: {
  config: ErrorConfig;
  error?: { message: string; code?: string };
}) {
  const Icon = config.icon;
  const PrimaryIcon = config.primaryAction.icon;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 max-w-md mx-auto text-center">
      <div className={`rounded-full ${config.iconBgColor} p-4`}>
        <Icon className={`w-12 h-12 ${config.iconColor}`} />
      </div>

      <h2 className="text-2xl font-bold">{config.title}</h2>
      <p className="text-muted-foreground">{config.description}</p>

      {config.showErrorDetails && error && (
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>
            <p className="text-sm">{error.message}</p>
            {error.code && (
              <p className="text-xs font-mono opacity-70 mt-1">
                Code: {error.code}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button onClick={config.primaryAction.onClick}>
          {PrimaryIcon && <PrimaryIcon className="w-4 h-4 mr-2" />}
          {config.primaryAction.label}
        </Button>

        {config.secondaryAction && (
          <Button onClick={config.secondaryAction.onClick} variant="outline">
            {config.secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   Page Layout
====================================================== */

function PageLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 mb-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex gap-2">
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {user?.name ? `${user.name}'s profile` : "Profile"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

/* ======================================================
   Provider View (FIXED - Uses correct provider-specific hook)
====================================================== */

function ProviderProfileView() {
  const {
    profile: providerProfile,
    loading,
    error,
    fetchProfile,
  } = useProviderProfile(true, PopulationLevel.DETAILED);

  // Helper function to check if error represents "no provider profile" state
  const isNoProviderProfileError = (err: any): boolean => {
    if (!err) return false;

    // 404 means no provider profile exists yet
    if (err.status === 404) return true;

    // Check error message patterns
    const message = err.message?.toLowerCase() || "";
    return (
      message.includes("do not have a provider profile") ||
      message.includes("no provider profile") ||
      message.includes("provider profile not found") ||
      message.includes("profile does not exist")
    );
  };

  // Show loading state
  if (loading) {
    return <LoadingOverlay message="Loading provider dashboard..." show />;
  }

  if (isNoProviderProfileError(error)) {
    return <ProviderProfileEmptyState />;
  }

  // Then check if no profile data AND no error
  if (!providerProfile && !error) {
    return <ProviderProfileEmptyState />;
  }

  // Then check for OTHER errors (network, server, etc.)
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center text-destructive py-8">
            Error loading provider profile: {error.message}
            <div className="mt-4">
              <Button onClick={() => fetchProfile()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Provider profile exists and loaded successfully
  if (providerProfile) {
    return <ProviderDashboard />;
  }

  // Fallback
  return <LoadingOverlay message="Loading provider dashboard..." show />;
}

/* ======================================================
   Client View
====================================================== */

function ClientProfileView() {
  const {
    loading,
    error,
    updateProfile,
    removeFavoriteService,
    removeFavoriteProvider,
    addAddress,
    removeAddress,
    setDefaultAddress,
    updateIdDetails,
  } = useClientProfile();

  const { profile: completeProfile } = useCompleteClientProfile();

  // Helper function to check if error represents "no profile" state
  const isNoProfileError = (err: any): boolean => {
    if (!err) return false;

    if (err.status === 404) return true;

    const message = err.message?.toLowerCase() || "";
    return (
      message.includes("do not have a client profile") ||
      message.includes("do not have a profile") ||
      message.includes("no client profile") ||
      message.includes("no profile") ||
      message.includes("client profile not found") ||
      message.includes("profile not found") ||
      message.includes("profile does not exist")
    );
  };

  if (loading) {
    return <LoadingOverlay message="Getting dashboard ready..." show />;
  }

  // Check error first, even if profile exists
  if (isNoProfileError(error)) {
    return <ClientProfileEmptyState />;
  }

  if (!completeProfile && !error) {
    return <ClientProfileEmptyState />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center text-destructive py-8">
            Error loading profile: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completeProfile) {
    return (
      <div className="container mx-auto py-8">
        <ClientProfileDisplay
          profile={completeProfile}
          onUpdateProfile={updateProfile}
          onRemoveFavoriteService={removeFavoriteService}
          onRemoveFavoriteProvider={removeFavoriteProvider}
          onAddAddress={addAddress}
          onRemoveAddress={removeAddress}
          onSetDefaultAddress={setDefaultAddress}
          onUpdateIdDetails={updateIdDetails}
        />
      </div>
    );
  }

  return <LoadingOverlay message="Getting dashboard ready..." show />;
}

/* ======================================================
   Main Page
====================================================== */

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // This gets the BASE user profile to determine the role
  const {
    completeProfile,
    loading: profileLoading,
    error: profileError,
    refetch,
  } = useCompleteProfile({ autoLoad: isAuthenticated });

  const isLoading = authLoading || (isAuthenticated && profileLoading);

  // Helper function to check if error represents "no profile" state
  const isNoProfileError = (err: any): boolean => {
    if (!err) return false;

    if (err.status === 404) return true;

    const message = err.message?.toLowerCase() || "";
    return (
      message.includes("do not have a") ||
      message.includes("no profile") ||
      message.includes("profile not found") ||
      message.includes("profile does not exist")
    );
  };

  if (isLoading) {
    return (
      <LoadingOverlay message="Getting profile ready, please wait..." show />
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <ErrorStateDisplay
          config={{
            icon: AlertCircle,
            iconBgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
            title: "Access Denied",
            description: "Please log in to view your profile.",
            primaryAction: {
              label: "Log In",
              onClick: () => router.push("/login"),
            },
          }}
        />
      </PageLayout>
    );
  }

  // Check error first
  if (isNoProfileError(profileError)) {
    return (
      <PageLayout>
        <ErrorStateDisplay
          config={{
            icon: UserX,
            iconBgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            title: "No Profile Found",
            description: `${
              user?.name ?? "You"
            } haven't created a profile yet.`,
            primaryAction: {
              label: "Create Profile",
              icon: UserPlus,
              onClick: () => router.push("/profile/create"),
            },
          }}
        />
      </PageLayout>
    );
  }

  if (!completeProfile && !profileError) {
    return (
      <PageLayout>
        <ErrorStateDisplay
          config={{
            icon: UserX,
            iconBgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            title: "No Profile Found",
            description: `${
              user?.name ?? "You"
            } haven't created a profile yet.`,
            primaryAction: {
              label: "Create Profile",
              icon: UserPlus,
              onClick: () => router.push("/profile/create"),
            },
          }}
        />
      </PageLayout>
    );
  }

  if (profileError) {
    return (
      <PageLayout>
        <ErrorStateDisplay
          config={{
            icon: ServerCrash,
            iconBgColor: "bg-red-100",
            iconColor: "text-red-600",
            title: "Error Loading Profile",
            description: profileError.message,
            primaryAction: {
              label: "Retry",
              icon: RefreshCw,
              onClick: refetch,
            },
          }}
          error={{ message: profileError.message, code: profileError.code }}
        />
      </PageLayout>
    );
  }

  if (completeProfile) {
    const isProvider = completeProfile.profile.role === UserRole.PROVIDER;

    return (
      <PageLayout>
        {isProvider ? <ProviderProfileView /> : <ClientProfileView />}
      </PageLayout>
    );
  }

  return (
    <LoadingOverlay message="Getting profile ready, please wait..." show />
  );
}
