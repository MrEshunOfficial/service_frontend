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
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Star,
  Image,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Briefcase,
  Home,
} from "lucide-react";

const mockData = {
  provider: {
    profile: {
      userId: {
        email: "postmantest@email.com",
        createdAt: "2025-12-27T14:03:40.539Z",
      },
      role: "service_provider",
      bio: "post man bio test",
      mobileNumber: "0541236434",
      profilePictureId: {
        thumbnailUrl:
          "https://res.cloudinary.com/dulp1cu0c/image/upload/c_fill,f_auto,g_auto,h_200,q_auto,w_200/v1/users/694fe73c466b08ffc8be80a8/profile_picture/pexels-mastercowley-1153369?_a=BAMAMiXy0",
      },
    },
    businessName: "test case services",
    isCompanyTrained: false,
    serviceOfferings: [
      {
        title: "Professional Home Cleaning Service",
        description:
          "Comprehensive home and office cleaning services tailored to your needs.",
        categoryId: {
          catName: "test",
        },
        coverImage: {
          thumbnailUrl:
            "https://res.cloudinary.com/dulp1cu0c/image/upload/c_fill,f_auto,g_auto,h_200,q_auto,w_200/v1/services/695059f17b974780ed85ae83/service_cover/pexels-karola-g-4239035?_a=BAMAMiXy0",
        },
        servicePricing: {
          serviceBasePrice: 250,
          includeTravelFee: true,
          currency: "GHS",
          platformCommissionRate: 0.2,
          providerEarnings: 200,
        },
        isActive: true,
      },
    ],
    BusinessGalleryImages: [
      {
        thumbnailUrl:
          "https://res.cloudinary.com/dulp1cu0c/image/upload/c_fill,f_auto,g_auto,h_200,q_auto,w_200/v1/providers/694fe73c466b08ffc8be80a8/provider_gallery/pexels-frank-wesneck-2154020533-34513508?_a=BAMAMiXy0",
      },
      {
        thumbnailUrl:
          "https://res.cloudinary.com/dulp1cu0c/image/upload/c_fill,f_auto,g_auto,h_200,q_auto,w_200/v1/providers/694fe73c466b08ffc8be80a8/provider_gallery/pexels-karola-g-4239035?_a=BAMAMiXy0",
      },
      {
        thumbnailUrl:
          "https://res.cloudinary.com/dulp1cu0c/image/upload/c_fill,f_auto,g_auto,h_200,q_auto,w_200/v1/providers/694fe73c466b08ffc8be80a8/provider_gallery/pexels-823sl-2294361?_a=BAMAMiXy0",
      },
      {
        thumbnailUrl:
          "https://res.cloudinary.com/dulp1cu0c/image/upload/c_fill,f_auto,g_auto,h_200,q_auto,w_200/v1/providers/694fe73c466b08ffc8be80a8/provider_gallery/pexels-shvetsa-3987142?_a=BAMAMiXy0",
      },
    ],
    providerContactInfo: {
      primaryContact: "0541234561",
      secondaryContact: "0203322114",
      businessEmail: "postman@gmail.com",
    },
    locationData: {
      ghanaPostGPS: "GW-0704-2777",
      nearbyLandmark: "Kotoku market",
      region: "Greater Accra Region",
      city: "Accra",
      district: "Ayawaso West Municipal District",
      locality: "North Dzorwulu",
      streetName: "Nii Nortey Nyanchi Street",
      houseNumber: "67",
      isAddressVerified: true,
    },
    isAlwaysAvailable: false,
    requireInitialDeposit: true,
    percentageDeposit: 25,
    workingHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "09:00", end: "14:00" },
    },
  },
};

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { provider } = mockData;
  const stats = [
    {
      label: "Total Earnings",
      value: `${provider.serviceOfferings[0].servicePricing.currency} ${provider.serviceOfferings[0].servicePricing.providerEarnings}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Active Services",
      value: provider.serviceOfferings.length,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      label: "Gallery Items",
      value: provider.BusinessGalleryImages.length,
      icon: Image,
      color: "text-purple-600",
    },
    { label: "Rating", value: "4.8", icon: Star, color: "text-yellow-600" },
  ];

  return (
    <div className="w-full space-y-3 p-2">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-blue-100 dark:border-blue-900 shadow-md">
            <AvatarImage src={provider.profile.profilePictureId.thumbnailUrl} />
            <AvatarFallback className="bg-blue-500 dark:bg-blue-600 text-white text-2xl">
              {provider.businessName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {provider.businessName}
              </h1>
              <Badge
                variant={
                  provider.serviceOfferings[0].isActive
                    ? "default"
                    : "secondary"
                }
                className="h-6"
              >
                {provider.serviceOfferings[0].isActive ? "Active" : "Inactive"}
              </Badge>
              {provider.locationData.isAddressVerified && (
                <Badge
                  variant="outline"
                  className="h-6 border-green-500 text-green-700 dark:border-green-400 dark:text-green-400"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              {provider.profile.bio}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{provider.profile.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{provider.profile.userId.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>
                  {provider.locationData.city}, {provider.locationData.region}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Edit Profile</Button>
            <Button>View Public Profile</Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-700 dark:bg-slate-800"
          >
            <CardContent className="p-6">
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
        <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:text-slate-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:text-slate-300"
          >
            Services
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:text-slate-300"
          >
            Gallery
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:text-slate-300"
          >
            Contact & Location
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(provider.workingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
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

            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                  <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Company Trained
                  </span>
                  <Badge
                    variant={
                      provider.isCompanyTrained ? "default" : "secondary"
                    }
                  >
                    {provider.isCompanyTrained ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Always Available
                  </span>
                  <Badge
                    variant={
                      provider.isAlwaysAvailable ? "default" : "secondary"
                    }
                  >
                    {provider.isAlwaysAvailable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Requires Deposit
                  </span>
                  <Badge
                    variant={
                      provider.requireInitialDeposit ? "default" : "secondary"
                    }
                  >
                    {provider.requireInitialDeposit
                      ? `Yes (${provider.percentageDeposit}%)`
                      : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400">
                    Member Since
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(
                      provider.profile.userId.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {provider.serviceOfferings.map((service, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={service.coverImage.thumbnailUrl}
                    alt={service.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {service.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="mb-3 dark:border-slate-600 dark:text-slate-300"
                      >
                        {service.categoryId.catName}
                      </Badge>
                      <p className="text-slate-600 dark:text-slate-300">
                        {service.description}
                      </p>
                    </div>
                    <Badge
                      variant={service.isActive ? "default" : "secondary"}
                      className="ml-4"
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                        {service.servicePricing.platformCommissionRate * 100}%
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
                        }
                      >
                        {service.servicePricing.includeTravelFee
                          ? "Included"
                          : "Not Included"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">
                Business Gallery
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Showcase your work and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {provider.BusinessGalleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer aspect-square"
                  >
                    <img
                      src={img.thumbnailUrl}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Primary Contact
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {provider.providerContactInfo.primaryContact}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Secondary Contact
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {provider.providerContactInfo.secondaryContact}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Business Email
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {provider.providerContactInfo.businessEmail}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Full Address
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {provider.locationData.houseNumber}{" "}
                    {provider.locationData.streetName}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {provider.locationData.locality},{" "}
                    {provider.locationData.district}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {provider.locationData.city}, {provider.locationData.region}
                  </p>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Ghana Post GPS
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {provider.locationData.ghanaPostGPS}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Nearby Landmark
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {provider.locationData.nearbyLandmark}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Address Verified
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboard;
