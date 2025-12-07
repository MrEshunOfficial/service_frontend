// File: app/services/[slug]/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  MapPin,
  Star,
  DollarSign,
  Tag,
  Share2,
  Heart,
  CheckCircle,
  Navigation,
  Clock,
  Award,
  AlertCircle,
} from "lucide-react";
import { useServiceBySlug } from "@/hooks/services/service.hook";
import {
  useCurrentLocation,
  useProviderUtils,
  useNearestProviders,
} from "@/hooks/profiles/useprovider.profile.hook";
import { ProviderProfile } from "@/types/provider.types";
import { toast } from "sonner";
import Image from "next/image";

// Avatar component with fallback
const ProviderAvatar = ({
  provider,
  size = "small",
}: {
  provider: {
    name: string;
    providerData: ProviderProfile;
  };
  size?: "small" | "medium" | "large";
}) => {
  const [imageError, setImageError] = useState(false);
  const profilePicture = provider.providerData?.profile?.profilePictureId;

  const sizeClasses = {
    small: "w-12 h-12 text-base",
    medium: "w-16 h-16 text-xl",
    large: "w-20 h-20 text-2xl",
  };

  const dimensions = {
    small: 48,
    medium: 64,
    large: 80,
  };

  // Show image if available and no error
  if (profilePicture?.url && !imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative`}
      >
        <Image
          src={profilePicture.url}
          alt={provider.name}
          width={dimensions[size]}
          height={dimensions[size]}
          className="object-cover"
          onError={() => setImageError(true)}
          priority={size === "large"}
        />
      </div>
    );
  }

  // Fallback to gradient with initials
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {provider.name.charAt(0).toUpperCase()}
    </div>
  );
};

export default function ServiceDetailsPage() {
  const router = useRouter();
  const { slug } = useParams();

  // Fetch service details
  const {
    data: service,
    loading: serviceLoading,
    error: serviceError,
    refetch: refetchService,
  } = useServiceBySlug(slug as string);

  // Get current location
  const {
    data: userLocation,
    loading: locationLoading,
    error: locationError,
  } = useCurrentLocation();

  // Search for providers offering this service near user
  const {
    providers,
    loading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
  } = useNearestProviders({
    latitude: userLocation?.latitude || 0,
    longitude: userLocation?.longitude || 0,
    serviceId: service?._id,
    limit: 20,
    maxDistance: 50, // 50km radius
  });

  console.log(providers);

  const [selectedProvider, setSelectedProvider] = useState<{
    id: string;
    name: string;
    avatar: null;
    rating: number;
    totalReviews: number;
    distance: number;
    distanceFormatted: string;
    location: string;
    locationFull: string;
    responseTime: string;
    completedJobs: number;
    verified: boolean;
    price: number;
    availability: string;
    isAvailableNow: boolean;
    workingHours?: any;
    isAlwaysAvailable: boolean;
    requiresDeposit: boolean;
    depositPercentage?: number;
    contactInfo: any;
    landmark?: string;
    providerData: ProviderProfile;
  } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sortBy, setSortBy] = useState("distance");

  // Provider utility functions
  const { isProviderActive, isProviderAvailableNow, getWorkingHoursForDay } =
    useProviderUtils();

  // Filter and calculate provider data
  const enrichedProviders = useMemo(() => {
    if (!providers || !userLocation) return [];

    return providers
      .filter((result) => isProviderActive(result.provider))
      .map((result) => {
        const provider = result.provider;
        const isAvailableNow = isProviderAvailableNow(provider);

        return {
          id: provider._id,
          name: provider.businessName || "Service Provider",
          avatar: null,
          rating: 0,
          totalReviews: 0,
          distance: result.distanceKm,
          distanceFormatted: result.distanceFormatted,
          location:
            provider.locationData.city ||
            provider.locationData.region ||
            "Ghana",
          locationFull: [
            provider.locationData.locality,
            provider.locationData.city,
            provider.locationData.region,
          ]
            .filter(Boolean)
            .join(", "),
          responseTime: "< 1 hour",
          completedJobs: 0,
          verified: provider.isCompanyTrained,
          price: service?.servicePricing?.serviceBasePrice || 0,
          availability: isAvailableNow ? "Available Now" : "closed",
          isAvailableNow,
          workingHours: provider.workingHours,
          isAlwaysAvailable: provider.isAlwaysAvailable,
          requiresDeposit: provider.requireInitialDeposit,
          depositPercentage: provider.percentageDeposit,
          contactInfo: provider.providerContactInfo,
          landmark: provider.locationData.nearbyLandmark,
          providerData: provider,
        };
      });
  }, [
    providers,
    userLocation,
    service,
    isProviderActive,
    isProviderAvailableNow,
  ]);

  // Sort providers
  const sortedProviders = useMemo(() => {
    if (!enrichedProviders.length) return [];

    const sorted = [...enrichedProviders];
    switch (sortBy) {
      case "distance":
        return sorted.sort((a, b) => a.distance - b.distance);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "availability":
        return sorted.sort((a, b) => {
          if (a.isAvailableNow && !b.isAvailableNow) return -1;
          if (!a.isAvailableNow && b.isAvailableNow) return 1;
          return a.distance - b.distance;
        });
      default:
        return sorted;
    }
  }, [enrichedProviders, sortBy]);

  const handleShare = async () => {
    if (!service) return;

    const url = window.location.href;
    const shareText = `Check out this service: ${service.title}\n\n${service.description}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: service.title, text: shareText, url });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          toast.success("✓ Link copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("✓ Link copied to clipboard!");
    }
  };

  const handleRequestProvider = (provider: (typeof enrichedProviders)[0]) => {
    if (!service) return;
    router.push(`/providers/${provider.id}?service=${service._id}`);
  };

  // Loading state
  if (serviceLoading || locationLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (serviceError || !service) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">
            Failed to load service details.
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
            onClick={refetchService}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-start justify-start bg-gray-50 dark:bg-gray-950 p-2 gap-2">
      <aside className="w-80 flex flex-col gap-2">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Available Providers
          </h2>

          {/* Location error */}
          {locationError && (
            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Enable location to see nearby providers
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {providersLoading
              ? "Searching..."
              : providersError
              ? "Unable to load providers"
              : `${sortedProviders.length} providers found`}
          </p>

          {/* Sort Options */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="distance">Nearest First</option>
              <option value="availability">Available First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Providers List */}
        <div className="overflow-y-auto max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-md">
          {providersLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Finding providers...
              </p>
            </div>
          ) : providersError ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                Failed to load providers
              </p>
              <button
                onClick={refetchProviders}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          ) : sortedProviders.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                No providers found nearby
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Try expanding your search area
              </p>
            </div>
          ) : (
            sortedProviders.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                  selectedProvider?.id === provider.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600"
                    : ""
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <ProviderAvatar provider={provider} />

                  <div className="flex-1 min-w-0">
                    {/* Name and Verified Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {provider.name}
                      </h3>
                      {provider.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Rating - placeholder for now */}
                    {provider.totalReviews > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {provider.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({provider.totalReviews} reviews)
                        </span>
                      </div>
                    )}

                    {/* Location and Distance */}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {provider.location} • {provider.distanceFormatted}
                      </span>
                    </div>

                    {/* Landmark if available */}
                    {provider.landmark && (
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Near {provider.landmark}
                        </span>
                      </div>
                    )}

                    {/* Working Hours Info */}
                    {!provider.isAlwaysAvailable && (
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {getWorkingHoursForDay(
                            provider.providerData,
                            new Date()
                              .toLocaleDateString("en-US", {
                                weekday: "long",
                              })
                              .toLowerCase()
                          )}
                        </span>
                      </div>
                    )}

                    {/* Deposit Required */}
                    {provider.requiresDeposit && provider.depositPercentage && (
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {provider.depositPercentage}% deposit required
                        </span>
                      </div>
                    )}

                    {/* Price and Availability */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          From
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: service.servicePricing?.currency || "USD",
                          }).format(provider.price)}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          provider.isAvailableNow
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {provider.availability}
                      </span>
                    </div>

                    {/* Request Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestProvider(provider);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      // disabled={!provider.isAvailableNow}
                    >
                      {provider.isAvailableNow
                        ? "Request Provider"
                        : "View Profile"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 overflow-y-auto max-h-[calc(100vh-7vh)]">
        <header className="w-full h-24 mb-3 border rounded-md p-4 bg-white dark:bg-gray-900">
          {sortedProviders.length > 0 ? (
            <div className="flex items-center gap-4 h-full">
              {/* Avatar */}
              <ProviderAvatar provider={sortedProviders[0]} />

              {/* Provider Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Nearest Provider
                  </span>
                  {sortedProviders[0].verified && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate mb-1">
                  {sortedProviders[0].name}
                </h3>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProvider?.locationFull}
                  </p>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      {sortedProviders[0].distanceFormatted}
                    </span>
                  </div>

                  {sortedProviders[0].isAvailableNow && (
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                      Available Now
                    </span>
                  )}

                  <span className="text-gray-600 dark:text-gray-400">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: service?.servicePricing?.currency || "USD",
                      minimumFractionDigits: 0,
                    }).format(sortedProviders[0].price)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRequestProvider(sortedProviders[0])}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-md flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!sortedProviders[0].isAvailableNow}
              >
                <Navigation className="w-4 h-4" />
                {sortedProviders[0].isAvailableNow
                  ? "Request Now"
                  : "View Profile"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {providersLoading
                    ? "Finding nearest provider..."
                    : "No providers available nearby"}
                </p>
              </div>
            </div>
          )}
        </header>
        <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Hero Section: Cover Image + Pricing Sidebar */}
          <div className="flex">
            {/* Cover Image */}
            <div className="relative flex-1 h-[400px] bg-gradient-to-br from-blue-500 to-purple-600">
              {service.coverImage?.url ? (
                <img
                  src={service.coverImage.url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag className="w-24 h-24 text-white/30" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg"
                >
                  <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Pricing Sidebar */}
            {service.servicePricing && (
              <div className="w-80 h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-5 h-full flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Pricing
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {service.servicePricing.currency || "USD"}
                    </p>
                  </div>

                  {/* Base Price */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Starting from
                    </p>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: service.servicePricing.currency || "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(service.servicePricing.serviceBasePrice)}
                    </div>
                  </div>

                  {/* Additional Fees */}
                  {(service.servicePricing.includeTravelFee ||
                    service.servicePricing.includeAdditionalFees) && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        May Include
                      </h3>

                      <div className="space-y-2">
                        {service.servicePricing.includeTravelFee && (
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded flex-shrink-0">
                              <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Travel Fee
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Based on distance
                              </p>
                            </div>
                          </div>
                        )}

                        {service.servicePricing.includeAdditionalFees && (
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded flex-shrink-0">
                              <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Add-ons
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Optional extras
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1 min-h-[20px]"></div>

                  {/* Bottom Notice */}
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                        <span className="font-semibold">
                          Price confirmed before booking.
                        </span>{" "}
                        Your provider will give you the final quote.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-3">
              <Tag className="w-4 h-4" />
              {service.category?.catName || "General"}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {service.title}
            </h1>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {service.description}
              </p>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
