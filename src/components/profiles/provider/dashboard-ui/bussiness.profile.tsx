"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Star,
  Image as ImageIcon,
  CheckCircle2,
  Briefcase,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProviderProfile } from "@/hooks/profiles/useProviderProfile";
import { PopulationLevel } from "@/types/base.types";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";
import { useRouter } from "next/navigation";
import { ProviderContactLocation } from "./ProviderContactLocation";
import { ProviderGallery } from "./ProviderGallery";
import { ProviderOverview } from "./ProviderOverview";
import { ProviderServices } from "./ProviderServices";

// Import child components

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  // Fetch provider profile with detailed population
  const {
    profile: rawProfile,
    loading,
    error,
    refreshProfile,
  } = useProviderProfile(true, PopulationLevel.DETAILED);

  // Extract profile from response wrapper if needed
  const profile = React.useMemo(() => {
    if (!rawProfile) return null;

    // Check if the response is wrapped in a "provider" key
    if ("provider" in rawProfile && typeof rawProfile.provider === "object") {
      return rawProfile.provider as PopulatedProviderProfile;
    }

    return rawProfile as PopulatedProviderProfile;
  }, [rawProfile]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading your provider profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <p className="font-semibold mb-2">Error loading profile</p>
            <p className="text-sm mb-4">{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshProfile}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <p className="font-semibold mb-2">No Provider Profile Found</p>
            <p className="text-sm mb-4">
              You haven't created a provider profile yet.
            </p>
            <Button size="sm">Create Provider Profile</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Type guard for populated profile
  const isPopulated =
    profile &&
    typeof profile.profile === "object" &&
    "userId" in profile.profile;

  if (!isPopulated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profile data is incomplete. Please try refreshing.
            <Button
              variant="outline"
              size="sm"
              onClick={refreshProfile}
              className="mt-2 ml-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Type-safe accessors
  const userProfile =
    typeof profile.profile === "object" && "userId" in profile.profile
      ? profile.profile
      : null;

  const profilePicture =
    userProfile?.profilePictureId &&
    typeof userProfile.profilePictureId === "object"
      ? userProfile.profilePictureId
      : null;

  const userBio = userProfile?.bio || "No bio provided";

  // Calculate stats
  const totalEarnings =
    profile.serviceOfferings?.reduce(
      (sum, service) =>
        sum +
        ((typeof service === "object" &&
          service.servicePricing?.providerEarnings) ||
          0),
      0
    ) || 0;

  const activeServices =
    profile.serviceOfferings?.filter(
      (service) => typeof service === "object" && service.isActive
    ).length || 0;

  const stats = [
    {
      label: "Total Potential Earnings",
      value: `GHS ${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Active Services",
      value: activeServices,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      label: "Gallery Items",
      value: profile.BusinessGalleryImages?.length || 0,
      icon: ImageIcon,
      color: "text-purple-600",
    },
    {
      label: "Profile Status",
      value: profile.isDeleted ? "Inactive" : "Active",
      icon: Star,
      color: profile.isDeleted ? "text-red-600" : "text-yellow-600",
    },
  ];

  // Handle Edit Profile
  const handleEditProfile = () => {
    router.push("/business-profile/edit");
  };

  return (
    <div className="w-full space-y-3 p-2">
      {/* Header Section */}
      <header className="p-4 bg-transparent border rounded-md mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-blue-100 dark:border-blue-900 shadow-md">
            <AvatarImage src={profilePicture?.thumbnailUrl} />
            <AvatarFallback className="bg-blue-500 dark:bg-blue-600 text-white text-2xl">
              {profile.businessName?.charAt(0).toUpperCase() || "P"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {profile.businessName || "Provider Profile"}
              </h1>
              {profile.isCompanyTrained && (
                <Badge
                  variant="outline"
                  className="h-6 border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-400"
                >
                  Company Trained
                </Badge>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300">{userBio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{profile.providerContactInfo.primaryContact}</span>
              </div>
              {profile.providerContactInfo.businessEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.providerContactInfo.businessEmail}</span>
                </div>
              )}
              {profile.locationData && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {profile.locationData.city}, {profile.locationData.region}
                    {profile.locationData?.isAddressVerified && (
                      <Badge
                        variant="outline"
                        className="ml-2 border-none text-green-700 dark:text-green-400 text-xs"
                      >
                        <CheckCircle2 size={12} className="mr-1" />
                        Verified
                      </Badge>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="hover:shadow-lg transition-shadow bg-transparent"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full bg-slate-100 dark:bg-slate-700 ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="border border-slate-300 dark:border-slate-600 p-1 bg-transparent">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
          >
            Services
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
          >
            Contact & Location
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
          >
            Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProviderOverview profile={profile} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ProviderServices profile={profile} />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <ProviderGallery profile={profile} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ProviderContactLocation profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboard;
