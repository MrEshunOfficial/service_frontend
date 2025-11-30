"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Search, Briefcase, Home, Shield } from "lucide-react";
import { usePublicServices } from "@/hooks/services/service.hook";
import ServiceCard from "@/components/services/ServiceCard";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useRouter } from "next/navigation";
import { useActiveCategories } from "@/hooks/services/services.category.hook";
import ServicesHeader from "@/components/services/ServicesHeader";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function PublicServicesPage() {
  const router = useRouter();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const { data: categories, loading: categoriesLoading } =
    useActiveCategories();

  // Build filters for API call
  const filters = useMemo(
    () => ({
      page,
      limit: 12,
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy:
        sortBy === "recent"
          ? "createdAt"
          : sortBy === "price-low"
          ? "price"
          : sortBy === "price-high"
          ? "price"
          : "title",
      sortOrder: (sortBy === "price-high" ? "desc" : "asc") as "asc" | "desc",
    }),
    [page, selectedCategory, selectedTags, sortBy]
  );

  const { services, total, totalPages, loading, error, refetch } =
    usePublicServices(filters);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedTags, sortBy, searchQuery, priceRange]);

  // Extract unique tags from services
  const allTags = useMemo(() => {
    if (!services || services.length === 0) return [];
    const tagSet = new Set<string>();
    services.forEach((service) => {
      service.tags?.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [services]);

  // Filter services client-side for search and price
  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];

    let filtered = [...services];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((service) => {
        const price = service.servicePricing?.serviceBasePrice || 0;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    return filtered;
  }, [services, searchQuery, priceRange]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (priceRange.min || priceRange.max) count++;
    return count;
  }, [selectedCategory, selectedTags, priceRange]);

  // ============================================
  // UPDATED: Handler for PUBLIC views - uses SLUG
  // ============================================
  const handleView = (id: string) => {
    const service = services.find((s) => s._id === id);
    if (!service) return;

    // Public page always uses slug for SEO-friendly URLs
    if (service.slug) {
      router.push(`/services/${service.slug}`);
    } else {
      // Fallback to ID if slug is somehow missing
      router.push(`/services/d1/${id}`);
    }
  };

  const handleShare = async (id: string) => {
    const service = services.find((s) => s._id === id);
    if (!service) return;

    const url = `${window.location.origin}/services/${service.slug}`;
    const priceText = service.servicePricing
      ? `\nStarting at: ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: service.servicePricing.currency || "USD",
        }).format(service.servicePricing.serviceBasePrice)}`
      : "";

    const shareText = `${service.title}\n\n${
      service.description
    }\n\nCategory: ${
      service.category?.catName || "General"
    }${priceText}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: service.title, text: shareText, url });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          alert("✓ Service details copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("✓ Service details copied to clipboard!");
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedTags([]);
    setPriceRange({ min: "", max: "" });
    setSortBy("recent");
    setPage(1);
  };

  if (loading && (!services || services.length === 0)) {
    return <LoadingOverlay message="Loading Services..." show={true} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Error: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950 p-2">
      {/* Breadcrumb */}
      <div className=" w-full p-3 border-b mb-3">
        <div className="w-full">
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
                  Service
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header Component */}
      <ServicesHeader
        total={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories || []}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        allTags={allTags}
      />

      {/* Services Grid */}
      <div className="w-full mt-2">
        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any services matching your criteria. Try
              adjusting your filters or search terms.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex flex-wrap items-start justify-start gap-4 p-2 h-[80vh] overflow-y-auto">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  variant="public"
                  onView={handleView}
                  onShare={handleShare}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favoriteIds.includes(service._id)}
                />
              ))}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all shadow-sm"
                >
                  Previous
                </button>

                <span className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
