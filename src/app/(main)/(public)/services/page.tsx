"use client";

import React, { useState, useMemo, useEffect, JSX } from "react";
import { Search, AlertCircle } from "lucide-react";
import { usePublicServices } from "@/hooks/services/service.hook";
import { useActiveCategories } from "@/hooks/services/services.category.hook";
import ServiceCard from "@/components/services/ServiceCard";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import ServicesHeader from "@/components/services/ServicesHeader";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useRouter } from "next/navigation";
import { Service } from "@/types/service.types";

type SortOption = "recent" | "title" | "price-low" | "price-high";

interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  priceRange: { min: string; max: string };
  sortBy: SortOption;
}

const ITEMS_PER_PAGE = 12;

export default function PublicServicesPage(): JSX.Element {
  const router = useRouter();

  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedCategory: "",
    selectedTags: [],
    priceRange: { min: "", max: "" },
    sortBy: "recent",
  });

  const [page, setPage] = useState<number>(1);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch categories
  const { data: categoriesData } = useActiveCategories();
  const categories = categoriesData ?? [];

  // Fetch all services (we'll filter client-side for better UX)
  const {
    services = [],
    loading,
    error,
    refetch,
  } = usePublicServices({
    limit: 1000,
    categoryId: filters.selectedCategory || undefined,
  });

  // Extract unique tags from all services
  const allTags = useMemo<string[]>(() => {
    const tagSet = new Set<string>();
    services.forEach((service: Service) => {
      service.tags?.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [services]);

  // Apply all filters and sorting
  const filteredAndSortedServices = useMemo<Service[]>(() => {
    if (!services || services.length === 0) return [];

    let result = [...services];

    // 1. Search filter (title, description, tags)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (service: Service) =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // 2. Tags filter (AND logic - service must have all selected tags)
    if (filters.selectedTags.length > 0) {
      result = result.filter((service: Service) =>
        filters.selectedTags.every((tag: string) => service.tags?.includes(tag))
      );
    }

    // 3. Price range filter
    const minPrice = filters.priceRange.min
      ? parseFloat(filters.priceRange.min)
      : 0;
    const maxPrice = filters.priceRange.max
      ? parseFloat(filters.priceRange.max)
      : Infinity;

    if (filters.priceRange.min || filters.priceRange.max) {
      result = result.filter((service: Service) => {
        const price = service.servicePricing?.serviceBasePrice ?? 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // 4. Apply sorting
    result.sort((a: Service, b: Service) => {
      switch (filters.sortBy) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "price-low":
          return (
            (a.servicePricing?.serviceBasePrice ?? 0) -
            (b.servicePricing?.serviceBasePrice ?? 0)
          );
        case "price-high":
          return (
            (b.servicePricing?.serviceBasePrice ?? 0) -
            (a.servicePricing?.serviceBasePrice ?? 0)
          );
        default:
          return 0;
      }
    });

    return result;
  }, [services, filters]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedServices.length / ITEMS_PER_PAGE
  );
  const paginatedServices = useMemo<Service[]>(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedServices, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Calculate active filters count
  const activeFiltersCount = useMemo<number>(() => {
    let count = 0;
    if (filters.selectedCategory) count++;
    if (filters.selectedTags.length > 0) count += filters.selectedTags.length;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.sortBy !== "recent") count++;
    return count;
  }, [filters]);

  // Filter update handlers
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ): void => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string): void => {
    setFilters((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const clearAllFilters = (): void => {
    setFilters({
      searchQuery: "",
      selectedCategory: "",
      selectedTags: [],
      priceRange: { min: "", max: "" },
      sortBy: "recent",
    });
    setPage(1);
  };

  // Action handlers
  const handleView = (id: string): void => {
    const service = services.find((s: Service) => s._id === id);
    if (!service) return;

    const url = service.slug
      ? `/services/${service.slug}`
      : `/services/d1/${id}`;
    router.push(url);
  };

  const handleShare = async (id: string): Promise<void> => {
    const service = services.find((s: Service) => s._id === id);
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
      service.categoryId?.catName || "General"
    }${priceText}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: shareText,
          url,
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          alert("✓ Service details copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("✓ Service details copied to clipboard!");
    }
  };

  const handleToggleFavorite = (id: string): void => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // Loading state
  if (loading && services.length === 0) {
    return <LoadingOverlay message="Loading Services..." show={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Services
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-6">
      {/* Header with filters */}
      <ServicesHeader
        total={filteredAndSortedServices.length}
        searchQuery={filters.searchQuery}
        setSearchQuery={(query) => updateFilter("searchQuery", query)}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        sortBy={filters.sortBy}
        setSortBy={(sort) => updateFilter("sortBy", sort as SortOption)}
        selectedCategory={filters.selectedCategory}
        setSelectedCategory={(category) =>
          updateFilter("selectedCategory", category)
        }
        categories={categories}
        selectedTags={filters.selectedTags}
        toggleTag={toggleTag}
        allTags={allTags}
        priceRange={filters.priceRange}
        setPriceRange={(range) => updateFilter("priceRange", range)}
      />

      {/* Services Grid */}
      <div className="w-full">
        {paginatedServices.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {filters.searchQuery || activeFiltersCount > 0
                ? "We couldn't find any services matching your criteria. Try adjusting your filters or search terms."
                : "There are no services available at the moment."}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedServices.map((service: Service) => (
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all shadow-sm"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (page <= 3) {
                      pageNumber = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          page === pageNumber
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

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

      {/* Results summary */}
      {filteredAndSortedServices.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(page * ITEMS_PER_PAGE, filteredAndSortedServices.length)} of{" "}
          {filteredAndSortedServices.length} services
        </div>
      )}
    </div>
  );
}
