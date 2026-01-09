"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Star,
  Image as ImageIcon,
  CheckCircle2,
  Briefcase,
  Home,
  Loader2,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  Upload,
  Save,
  X,
  Eye,
  Plus,
  icons,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProviderProfile } from "@/hooks/profiles/useProviderProfile";
import { PopulationLevel } from "@/types/base.types";
import {
  UpdateProviderProfileRequest,
  PopulatedProviderProfile,
} from "@/types/profiles/provider-profile.types";
import { LocationSectionWithMap } from "./ProviderLocationWithMap";
import { useRouter } from "next/navigation";

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<
    Partial<UpdateProviderProfileRequest>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch provider profile with detailed population
  const {
    profile: rawProfile,
    loading,
    error,
    refreshProfile,
    updateProfile,
    deleteProfile,
    restoreProfile,
    updateIdDetails,
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
              className="mt-2">
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
              className="mt-2 ml-2">
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

  const router = useRouter();
  // Handle Edit Profile
  const handleEditProfile = () => {
    router.push("/business-profile/edit");
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editFormData);
      setIsEditDialogOpen(false);
      await refreshProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Profile
  const handleDeleteProfile = async () => {
    setIsSaving(true);
    try {
      await deleteProfile();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Restore Profile
  const handleRestoreProfile = async () => {
    setIsSaving(true);
    try {
      await restoreProfile();
      await refreshProfile();
    } catch (err) {
      console.error("Failed to restore profile:", err);
    } finally {
      setIsSaving(false);
    }
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
                  className="h-6 border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-400">
                  Company Trained
                </Badge>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300">{userBio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{profile.providerContactInfo.primaryContact}</span> {"."}
              </div>
              {profile.providerContactInfo.businessEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.providerContactInfo.businessEmail}</span> {"."}
                </div>
              )}
              {profile.locationData && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {profile.locationData.city}
                    {""} {profile.locationData.region}{" "}
                    {profile.locationData?.isAddressVerified && (
                      <Badge
                        variant="outline"
                        className=" border-none text-green-700 ark:border-green-400 dark:text-green-400 text-xs">
                        <CheckCircle2 size={12} />
                        Verified location
                      </Badge>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size={"icon"} onClick={handleEditProfile}>
              <Edit size={14} />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="hover:shadow-lg transition-shadow bg-transparent">
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
                  className={`p-3 rounded-full bg-slate-100 dark:bg-slate-700 ${stat.color}`}>
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
        className="space-y-4">
        <TabsList className="border border-slate-300 dark:border-slate-600 p-1 bg-transparent">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300">
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300">
            Services
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300">
            Contact & Location
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 dark:text-slate-300">
            Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Working Hours Card */}
            {profile.workingHours && !profile.isAlwaysAvailable && (
              <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(profile.workingHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center py-2 border-b border-slate-300 dark:border-slate-600 last:border-0">
                      <span className="font-medium capitalize text-slate-700 dark:text-slate-300">
                        {day}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {hours.start} - {hours.end}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Always Available Card */}
            {profile.isAlwaysAvailable && (
              <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-green-100/50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        Always Available
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        You accept bookings 24/7
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Details Card */}
            <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-300 dark:border-slate-600">
                  <span className="text-slate-700 dark:text-slate-300">
                    Company Trained
                  </span>
                  <Badge
                    variant={
                      profile.isCompanyTrained ? "default" : "secondary"
                    }>
                    {profile.isCompanyTrained ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-300 dark:border-slate-600">
                  <span className="text-slate-700 dark:text-slate-300">
                    Always Available
                  </span>
                  <Badge
                    variant={
                      profile.isAlwaysAvailable ? "default" : "secondary"
                    }>
                    {profile.isAlwaysAvailable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-300 dark:border-slate-600">
                  <span className="text-slate-700 dark:text-slate-300">
                    Requires Deposit
                  </span>
                  <Badge
                    variant={
                      profile.requireInitialDeposit ? "default" : "secondary"
                    }>
                    {profile.requireInitialDeposit
                      ? `Yes (${profile.percentageDeposit}%)`
                      : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-700 dark:text-slate-300">
                    Member Since
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {profile.serviceOfferings && profile.serviceOfferings.length > 0 ? (
            profile.serviceOfferings.map((service, idx) => {
              if (typeof service === "string") return null;

              return (
                <Card
                  key={idx}
                  className="overflow-hidden border border-slate-300 dark:border-slate-600 bg-transparent hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {service.coverImage &&
                      typeof service.coverImage === "object" && (
                        <div className="md:w-48 md:h-48 shrink-0">
                          <img
                            src={service.coverImage.thumbnailUrl}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {service.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="mb-2 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300">
                            {typeof service.categoryId === "object"
                              ? service.categoryId.catName
                              : "Category"}
                          </Badge>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {service.description}
                          </p>
                        </div>
                        <Badge
                          variant={service.isActive ? "default" : "secondary"}
                          className="ml-3 shrink-0">
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {service.servicePricing && (
                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Base Price
                            </p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              {service.servicePricing.currency}{" "}
                              {service.servicePricing.serviceBasePrice}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Your Earnings
                            </p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                              {service.servicePricing.currency}{" "}
                              {service.servicePricing.providerEarnings}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Commission Rate
                            </p>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                              {(service.servicePricing.platformCommissionRate ??
                                0) * 100}
                              %
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Travel Fee
                            </p>
                            <Badge
                              variant={
                                service.servicePricing.includeTravelFee
                                  ? "default"
                                  : "secondary"
                              }>
                              {service.servicePricing.includeTravelFee
                                ? "Included"
                                : "Not Included"}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Services Yet
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Start by adding your first service offering
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-slate-100">
                    Business Gallery
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Showcase your work and services
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.BusinessGalleryImages &&
              profile.BusinessGalleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.BusinessGalleryImages.map((img, idx) => {
                    if (typeof img === "string") return null;

                    return (
                      <div
                        key={idx}
                        className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer aspect-square">
                        <img
                          src={img.thumbnailUrl || img.url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No Gallery Images
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">
                    Upload images to showcase your work
                  </p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Information Card */}
            <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Primary Contact
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {profile.providerContactInfo.primaryContact}
                    </p>
                  </div>
                </div>

                {profile.providerContactInfo.secondaryContact && (
                  <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Secondary Contact
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {profile.providerContactInfo.secondaryContact}
                      </p>
                    </div>
                  </div>
                )}

                {profile.providerContactInfo.businessContact && (
                  <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Business Contact
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {profile.providerContactInfo.businessContact}
                      </p>
                    </div>
                  </div>
                )}

                {profile.providerContactInfo.businessEmail && (
                  <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Business Email
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {profile.providerContactInfo.businessEmail}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location with Map */}
            {profile.locationData && (
              <LocationSectionWithMap
                location={profile.locationData}
                showDistance={false}
                businessName={profile.businessName}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboard;
