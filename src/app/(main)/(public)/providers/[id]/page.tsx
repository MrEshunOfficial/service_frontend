"use client";

import React from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import BusinessProfile from "@/components/profiles/provider/bussiness.profile";
import { useProviderProfile } from "@/hooks/profiles/useprovider.profile.hook";
import {
  Home,
  AlertCircle,
  RefreshCw,
  UserX,
  WifiOff,
  ServerCrash,
  ArrowLeft,
  Search,
} from "lucide-react";
import { APIError } from "@/lib/api/base/api-client";

type ErrorType = "network" | "server" | "not_found" | "generic";

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
    <div className="flex flex-col items-center justify-center space-y-4 p-8 max-w-md mx-auto text-center min-h-[400px]">
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
          variant="default">
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

export default function ProviderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const providerId = params?.id as string;
  const serviceId = searchParams?.get("service");

  // Use the provider profile hook
  const {
    data: provider,
    loading,
    error,
    refetch,
  } = useProviderProfile(providerId, {
    enabled: !!providerId,
    autoLoad: true,
  });

  const getErrorType = (error: APIError): ErrorType => {
    if (
      !error.status ||
      error.code === "NETWORK_ERROR" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT"
    ) {
      return "network";
    }

    if (error.status && error.status >= 500 && error.status < 600) {
      return "server";
    }

    if (error.status === 404) {
      return "not_found";
    }

    return "generic";
  };

  const getErrorConfig = (errorType: ErrorType): ErrorConfig => {
    const goToSearch = () => router.push("/search");
    const goBack = () => router.back();
    const handleRetry = () => refetch();

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
        secondaryAction: {
          label: "Go Back",
          onClick: goBack,
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
          label: "Browse Providers",
          onClick: goToSearch,
        },
        showErrorDetails: true,
      },
      not_found: {
        icon: UserX,
        iconBgColor: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        title: "Provider Not Found",
        description:
          "We couldn't find the provider you're looking for. They may have removed their profile or the link might be incorrect.",
        primaryAction: {
          label: "Browse Providers",
          icon: Search,
          onClick: goToSearch,
        },
        secondaryAction: {
          label: "Go Back",
          onClick: goBack,
        },
      },
      generic: {
        icon: AlertCircle,
        iconBgColor: "bg-red-100 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
        title: "Something Went Wrong",
        description:
          "An unexpected error occurred while loading the provider details.",
        primaryAction: {
          label: "Try Again",
          icon: RefreshCw,
          onClick: handleRetry,
        },
        secondaryAction: {
          label: "Go Back",
          onClick: goBack,
        },
        showErrorDetails: true,
      },
    };

    return configs[errorType];
  };

  const handleBookService = () => {
    // Navigate to booking page with provider and service info
    const params = new URLSearchParams();
    if (serviceId) params.set("service", serviceId);
    router.push(`/bookings/create/${providerId}?${params.toString()}`);
  };

  const handleNavigate = () => {
    // Open Google Maps with provider location
    if (provider?.locationData.gpsCoordinates) {
      const { latitude, longitude } = provider.locationData.gpsCoordinates;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        "_blank"
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <LoadingOverlay message="Loading provider details..." show={true} />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorType = getErrorType(error);
    const errorConfig = getErrorConfig(errorType);

    return (
      <div className="h-full flex flex-col">
        <div className="max-w-7xl mx-auto w-full p-3 mb-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                  <Home className="w-4 h-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/search"
                  className="text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                  Search
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                  Provider Details
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1 w-full relative overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <ErrorStateDisplay
              config={errorConfig}
              error={{ message: error.message }}
            />
          </div>
        </div>
      </div>
    );
  }

  // No provider data (shouldn't happen if no error, but safety check)
  if (!provider) {
    return (
      <div className="h-full w-full flex flex-col p-2 items-center justify-center text-muted-foreground">
        no provider found
      </div>
    );
  }

  // Success state - Display provider details
  return (
    <div className="h-full w-full p-2">
      {/* Breadcrumb */}
      <div className=" w-full p-3 mb-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/search"
                className="text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                Search
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                {provider.businessName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Back Button */}
      <div className="w-full mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 w-full min-h-screen relative overflow-auto">
        <div className="w-full h-full">
          {/* Using BusinessProfile in public mode to display provider details to clients */}
          <BusinessProfile
            provider={provider}
            variant="full"
            mode="public"
            showActions={true}
            showDistance={false}
            onViewServices={handleBookService}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  );
}
