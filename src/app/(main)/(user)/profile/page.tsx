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
import { UserRole } from "@/types/base.types";
import { APIError } from "@/lib/api/base/api-client";
import {
  Home,
  WifiOff,
  ServerCrash,
  AlertCircle,
  RefreshCw,
  UserX,
  UserPlus,
  LucideIcon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
type ErrorType =
  | "network"
  | "server"
  | "authorization"
  | "not_found"
  | "generic";

interface ErrorConfig {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showErrorDetails?: boolean;
}

// Shared error display component
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {config.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">{config.description}</p>
      {config.showErrorDetails && error && (
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>
            <p className="text-sm">{error.message}</p>
            {error.code && (
              <p className="text-xs font-mono mt-1 opacity-70">
                Code: {error.code}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3">
        <Button
          onClick={config.primaryAction.onClick}
          className="gap-2"
          variant="default"
        >
          {PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
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

// Page wrapper component
function PageLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col ">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto w-full p-3 mb-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                {user?.name ? `${user.name}'s profile` : "Profile"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Content */}
      <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    completeProfile,
    loading: profileLoading,
    error,
    refetch,
  } = useCompleteProfile({
    autoLoad: isAuthenticated,
  });

  const isLoading = authLoading || (isAuthenticated && profileLoading);

  // Helper to determine error type
  const getErrorType = (error: APIError): ErrorType => {
    // Network errors - check multiple indicators
    if (
      !error.status || // No status usually means network failure
      error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("fetch") ||
      error.message?.toLowerCase().includes("connection") ||
      error.message?.toLowerCase().includes("offline") ||
      error.code === "NETWORK_ERROR" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT"
    ) {
      return "network";
    }

    // Server errors (5xx status codes)
    if (error.status && error.status >= 500 && error.status < 600) {
      return "server";
    }

    // Authorization errors (401, 403)
    if (error.status === 401 || error.status === 403) {
      return "authorization";
    }

    // Profile not found (404)
    if (error.status === 404) {
      return "not_found";
    }

    return "generic";
  };

  // Helper to get error configuration
  const getErrorConfig = (
    errorType: ErrorType,
    userName?: string
  ): ErrorConfig => {
    const goHome = () => (window.location.href = "/");
    const handleRetry = () => refetch();
    const handleCreateProfile = () =>
      (window.location.href = "/profile/create");
    const handleLogin = () => (window.location.href = "/login");

    const configs: Record<ErrorType, ErrorConfig> = {
      network: {
        icon: WifiOff,
        iconBgColor: "bg-red-100 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
        title: "Connection Lost",
        description:
          "We couldn't connect to the server. Please check your internet connection and try again.",
        primaryAction: {
          label: "Retry Connection",
          icon: RefreshCw,
          onClick: handleRetry,
        },
      },
      server: {
        icon: ServerCrash,
        iconBgColor: "bg-orange-100 dark:bg-orange-900/20",
        iconColor: "text-orange-600 dark:text-orange-400",
        title: "Server Error",
        description:
          "Something went wrong on our end. Our team has been notified and we're working to fix it.",
        primaryAction: {
          label: "Try Again",
          icon: RefreshCw,
          onClick: handleRetry,
        },
        secondaryAction: {
          label: "Go Home",
          onClick: goHome,
        },
        showErrorDetails: true,
      },
      authorization: {
        icon: AlertCircle,
        iconBgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        title: "Oops! Access Denied",
        description:
          "It looks like you’re not logged in yet. Please log in to continue.",
        primaryAction: {
          label: "Log In",
          onClick: handleLogin,
        },
        secondaryAction: {
          label: "Go Home",
          onClick: goHome,
        },
      },
      not_found: {
        icon: UserX,
        iconBgColor: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        title: "No Profile Found",
        description: `${
          userName ? `${userName}, you` : "You"
        } haven't set up your profile yet. Create one to get started!`,
        primaryAction: {
          label: "Create Profile",
          icon: UserPlus,
          onClick: handleCreateProfile,
        },
        secondaryAction: {
          label: "Go Home",
          onClick: goHome,
        },
      },
      generic: {
        icon: AlertCircle,
        iconBgColor: "bg-red-100 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
        title: "Something Went Wrong",
        description: "An unexpected error occurred while loading your profile.",
        primaryAction: {
          label: "Try Again",
          icon: RefreshCw,
          onClick: handleRetry,
        },
        secondaryAction: {
          label: "Go Home",
          onClick: goHome,
        },
        showErrorDetails: true,
      },
    };

    return configs[errorType];
  };

  // Loading state
  if (isLoading) {
    return (
      <LoadingOverlay
        message="getting profile ready, please wait..."
        show={true}
      />
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    const errorConfig = getErrorConfig("authorization", user?.name);
    return (
      <PageLayout>
        <ErrorStateDisplay config={errorConfig} />
      </PageLayout>
    );
  }

  // Error states - Check for any error object (truthy check)
  if (error) {
    // Debug: log error details to help identify the issue
    console.log("Error detected:", {
      message: error.message,
      code: error.code,
      status: error.status,
      fullError: error,
    });

    const errorType = getErrorType(error);
    console.log("Detected error type:", errorType);

    const errorConfig = getErrorConfig(errorType, user?.name);

    return (
      <PageLayout>
        <ErrorStateDisplay
          config={errorConfig}
          error={{ message: error.message, code: error.code }}
        />
      </PageLayout>
    );
  }

  // No profile state (when authenticated, no error, but no profile data)
  if (!completeProfile) {
    const errorConfig = getErrorConfig("not_found", user?.name);

    return (
      <PageLayout>
        <ErrorStateDisplay config={errorConfig} />
      </PageLayout>
    );
  }

  // Success state - Profile exists
  return (
    <PageLayout>
      {completeProfile?.profile.role === UserRole.PROVIDER ? (
        <div className="text-muted">business profile dashboard unavailable</div>
      ) : (
        <div className="text-muted">client profile dashboard unavailable</div>
      )}
    </PageLayout>
  );
}
