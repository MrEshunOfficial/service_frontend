// File: app/services/[slug]/page.js
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
} from "lucide-react";
import { useServiceBySlug } from "@/hooks/services/service.hook";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const { slug } = useParams();
  const {
    data: service,
    loading,
    error,
    refetch,
  } = useServiceBySlug(slug as string);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sortBy, setSortBy] = useState("distance");

  // Mock providers data - replace with actual API call
  const providers = useMemo(
    () => [
      {
        id: "1",
        name: "John's Professional Services",
        avatar: null,
        rating: 4.8,
        totalReviews: 127,
        distance: 2.3,
        location: "Accra Central",
        responseTime: "< 1 hour",
        completedJobs: 342,
        verified: true,
        price: service?.servicePricing?.serviceBasePrice || 0,
        availability: "Available Now",
      },
      {
        id: "2",
        name: "Premium Solutions Ltd",
        avatar: null,
        rating: 4.9,
        totalReviews: 89,
        distance: 5.1,
        location: "East Legon",
        responseTime: "< 2 hours",
        completedJobs: 234,
        verified: true,
        price: (service?.servicePricing?.serviceBasePrice || 0) * 1.15,
        availability: "Available Today",
      },
      {
        id: "3",
        name: "Quick Fix Services",
        avatar: null,
        rating: 4.6,
        totalReviews: 156,
        distance: 8.7,
        location: "Tema",
        responseTime: "< 3 hours",
        completedJobs: 198,
        verified: false,
        price: (service?.servicePricing?.serviceBasePrice || 0) * 0.9,
        availability: "Available Tomorrow",
      },
    ],
    [service]
  );

  const sortedProviders = useMemo(() => {
    const sorted = [...providers];
    switch (sortBy) {
      case "distance":
        return sorted.sort((a, b) => a.distance - b.distance);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }, [providers, sortBy]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = `Check out this service: ${service.title}\n\n${service.description}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: service.title, text: shareText, url });
      } catch (error) {
        if (error.name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          alert("✓ Link copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("✓ Link copied to clipboard!");
    }
  };

  const handleRequestProvider = (provider) => {
    router.push(`/providers/${provider.id}?service=${service._id}`);
  };

  if (loading) {
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

  if (error || !service) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">
            Failed to load service details.
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
            onClick={refetch}
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
        <>
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Available Providers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {providers.length} providers nearby
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
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Providers List */}
          <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
            {sortedProviders.map((provider) => (
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {provider.name.charAt(0)}
                  </div>

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

                    {/* Rating */}
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

                    {/* Location and Distance */}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {provider.location} • {provider.distance} km away
                      </span>
                    </div>

                    {/* Price and Availability */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: service.servicePricing?.currency || "USD",
                          }).format(provider.price)}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        {provider.availability}
                      </span>
                    </div>

                    {/* Request Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestProvider(provider);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Request Provider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      </aside>
      <section className="flex-1 overflow-y-auto max-h-[calc(100vh-7vh)]">
        <header className="w-full h-27 mb-2 border rounded p-2">
          display the data of the nearest providers
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
