import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/types/category.types";
import Image from "next/image";

interface ServicesHeaderProps {
  total: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  categories?: Category[];
  selectedTags?: string[];
  toggleTag?: (tag: string) => void;
  allTags?: string[];
}

export default function ServicesHeader({
  total,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  selectedCategory = "",
  setSelectedCategory,
  categories = [],
  selectedTags = [],
  toggleTag,
}: ServicesHeaderProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedTags && selectedTags.length > 0) count += selectedTags.length;
    if (sortBy !== "recent") count++;
    return count;
  };

  const totalActiveFilters = getActiveFiltersCount();
  const displayedCategories = categories?.slice(0, 2) || [];
  const hasMoreCategories = (categories?.length || 0) > 2;

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) =>
    cat.catName.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const handleCategorySelect = (categoryId: string): void => {
    if (setSelectedCategory) {
      setSelectedCategory(categoryId);
      setShowAllCategories(false);
      setCategorySearchQuery("");
    }
  };

  const handleCloseAllCategories = (): void => {
    setShowAllCategories(false);
    setCategorySearchQuery("");
  };

  return (
    <header className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Service Count */}
        <div className="flex-1">
          <h1 className="text-lg font-bold whitespace-nowrap">Services</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {total} {total === 1 ? "service" : "services"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-80 flex-shrink min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Filter Popover */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-shrink-0 ${
                showFilters || totalActiveFilters > 0
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400"
                  : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              {totalActiveFilters > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {totalActiveFilters}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "recent", label: "Most Recent" },
                    { value: "title", label: "Name (A-Z)" },
                    { value: "price-low", label: "Price: Low" },
                    { value: "price-high", label: "Price: High" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              {setSelectedCategory && categories && categories.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Category
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={
                          selectedCategory === "" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory("")}
                        className="text-xs"
                      >
                        All
                      </Button>
                      {displayedCategories.map((cat) => (
                        <Button
                          key={cat._id}
                          variant={
                            selectedCategory === cat._id ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedCategory(cat._id)}
                          className="text-xs flex items-center justify-start gap-2 p-1"
                        >
                          <div className="relative w-6 h-6 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group">
                            {(() => {
                              const imageUrl = cat.catCoverId?.thumbnailUrl;
                              return imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={cat.catName}
                                  fill
                                  className="object-cover rounded-full"
                                  sizes="96px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                </div>
                              );
                            })()}
                          </div>
                          {cat.catName}
                        </Button>
                      ))}
                    </div>

                    {/* View All Categories Button */}
                    {hasMoreCategories && (
                      <Popover
                        open={showAllCategories}
                        onOpenChange={(open) => {
                          setShowAllCategories(open);
                          if (!open) {
                            setCategorySearchQuery("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs flex items-center justify-center gap-1"
                          >
                            View All Categories
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 mb-3"
                          side="left"
                          align="center"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm">
                                All Categories
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCloseAllCategories}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Category Search */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <input
                                type="text"
                                placeholder="Search categories..."
                                value={categorySearchQuery}
                                onChange={(e) =>
                                  setCategorySearchQuery(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                              />
                            </div>

                            {/* Category List */}
                            <div className="flex flex-col gap-2 h-[75vh] overflow-y-auto">
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                  <Button
                                    key={cat._id}
                                    variant={
                                      selectedCategory === cat._id
                                        ? "default"
                                        : "outline"
                                    }
                                    size="lg"
                                    onClick={() =>
                                      handleCategorySelect(cat._id)
                                    }
                                    className="text-xs w-full flex items-center justify-start gap-2 p-2"
                                  >
                                    <div className="relative w-6 h-6 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group">
                                      {(() => {
                                        const imageUrl =
                                          cat.catCoverId?.thumbnailUrl;
                                        return imageUrl ? (
                                          <Image
                                            src={imageUrl}
                                            alt={cat.catName}
                                            fill
                                            className="object-cover rounded-full"
                                            sizes="96px"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    <span className="capitalize">
                                      {cat.catName}
                                    </span>
                                  </Button>
                                ))
                              ) : (
                                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                  No categories found
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {totalActiveFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (setSelectedCategory) setSelectedCategory("");
                    if (selectedTags && toggleTag) {
                      selectedTags.forEach((tag) => toggleTag(tag));
                    }
                    setSortBy("recent");
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
