"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types/category.types";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Grid,
  List,
  RefreshCw,
  Plus,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CardContext,
  CategoryVariant,
  CategoryCardAction,
  SharedCategoryCard,
} from "./SharedServiceCategoryCard";

import { useAdminCategory } from "@/hooks/services/categories/useAdminCategories";

// ============================================================================
// Type Definitions
// ============================================================================

type CategoryFilter = "all" | "active" | "inactive";
type ViewMode = "grid" | "list";

interface CategoryListProps {
  includeSubcategories?: boolean;
  includeServicesCount?: boolean;
  limit?: number;
  onCategoryClick?: (category: Category) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  includeInactive?: boolean;
  defaultFilter?: CategoryFilter;
  context?: CardContext;
}

// ============================================================================
// Main Component
// ============================================================================

const CategoryList: React.FC<CategoryListProps> = ({
  includeSubcategories = true,
  includeServicesCount = true,
  limit = 20,
  onCategoryClick,
  showSearch = true,
  searchPlaceholder = "Search categories...",
  className,
  includeInactive = true,
  defaultFilter = "all",
  context = "admin",
}) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [categoryToRestore, setCategoryToRestore] = useState<Category | null>(
    null
  );
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>(defaultFilter);

  // Hook usage with proper destructuring
  const {
    categories,
    allCategories,
    inactiveCategories,
    searchResults,
    searchQuery,
    isLoading,
    error,
    fetchAllCategories,
    fetchInactiveCategories,
    searchAllCategories,
    searchInactiveCategories,
    clearSearch,
    setSearchQuery,
    deleteCategory,
    restoreCategory,
    bulkDelete,
    bulkRestore,
    bulkToggleStatus,
    clearError,
    refetch,
  } = useAdminCategory({
    autoFetchOnMount: true,
    defaultParams: {
      limit,
      includeSubcategories,
      includeServicesCount,
      includeUserData: true,
    },
    includeInactive,
  });

  // ============================================================================
  // Computed Values
  // ============================================================================

  const getFilteredCategories = useCallback((): Category[] => {
    if (searchQuery) return searchResults;

    const filterMap: Record<CategoryFilter, Category[]> = {
      all: allCategories,
      active: categories.filter((c) => c.isActive),
      inactive: inactiveCategories,
    };

    return filterMap[categoryFilter] || categories;
  }, [
    searchQuery,
    searchResults,
    categoryFilter,
    allCategories,
    categories,
    inactiveCategories,
  ]);

  const displayCategories = getFilteredCategories();
  const inactiveCount = inactiveCategories.length;

  const selectedActiveCount = selectedCategories.filter(
    (c) => c.isActive && !c.isDeleted
  ).length;

  const selectedInactiveCount = selectedCategories.filter(
    (c) => !c.isActive || c.isDeleted
  ).length;

  const selectedDeletedCount = selectedCategories.filter(
    (c) => c.isDeleted
  ).length;

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleAction = useCallback(
    async (
      action: () => Promise<unknown>,
      successMsg: string,
      errorMsg: string
    ): Promise<void> => {
      try {
        await action();
        if (successMsg) {
          toast.success(successMsg);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        toast.error(`${errorMsg}: ${errorMessage}`);
      }
    },
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const query = e.target.value;
      setSearchQuery(query);

      if (!query.trim()) {
        clearSearch();
        return;
      }

      const searchFn =
        categoryFilter === "inactive"
          ? searchInactiveCategories
          : searchAllCategories;
      searchFn(query, limit);
    },
    [
      setSearchQuery,
      searchAllCategories,
      searchInactiveCategories,
      clearSearch,
      limit,
      categoryFilter,
    ]
  );

  const handleFilterChange = useCallback(
    async (filter: CategoryFilter): Promise<void> => {
      setCategoryFilter(filter);
      clearSearch();
      setSelectedCategories([]);

      const fetchFn =
        filter === "inactive" ? fetchInactiveCategories : fetchAllCategories;

      await handleAction(
        () =>
          fetchFn({
            limit,
            includeSubcategories,
            includeServicesCount,
            includeUserData: true,
          }),
        "",
        "Failed to filter categories"
      );
    },
    [
      clearSearch,
      fetchAllCategories,
      fetchInactiveCategories,
      handleAction,
      limit,
      includeSubcategories,
      includeServicesCount,
    ]
  );

  const toggleSelection = useCallback(
    (categoryVariant: CategoryVariant): void => {
      const category = categoryVariant as Category;
      setSelectedCategories((prev) =>
        prev.some((c) => c._id === category._id)
          ? prev.filter((c) => c._id !== category._id)
          : [...prev, category]
      );
    },
    []
  );

  const isSelected = useCallback(
    (category: Category): boolean =>
      selectedCategories.some((c) => c._id === category._id),
    [selectedCategories]
  );

  const handleCategoryAction = useCallback(
    (action: CategoryCardAction, categoryVariant: CategoryVariant): void => {
      const category = categoryVariant as Category;

      switch (action) {
        case "explore":
          if (onCategoryClick) {
            onCategoryClick(category);
          } else {
            const basePath = category.isDeleted
              ? "/admin/services/categories/deleted"
              : "/admin/services/categories";
            router.push(`${basePath}/${category._id}`);
          }
          break;

        case "edit":
          router.push(`/admin/services/categories/${category._id}/edit`);
          break;

        case "archive":
          setCategoryToDelete(category);
          break;

        case "restore":
          setCategoryToRestore(category);
          break;

        case "delete":
          setCategoryToDelete(category);
          break;

        case "toggle-status":
          if (category.isActive) {
            setCategoryToDelete(category);
          } else {
            setCategoryToRestore(category);
          }
          break;

        case "moderate":
          router.push(`/admin/services/categories/${category._id}/moderate`);
          break;

        case "share":
          navigator.clipboard.writeText(
            `${window.location.origin}/categories/${category.slug}`
          );
          toast.success("Category link copied to clipboard");
          break;

        default:
          console.warn(`Unhandled action: ${action}`);
          break;
      }
    },
    [onCategoryClick, router]
  );

  const handleCategoryUpdate = useCallback((): void => {
    const fetchFn =
      categoryFilter === "inactive"
        ? fetchInactiveCategories
        : fetchAllCategories;

    fetchFn({
      limit,
      includeSubcategories,
      includeServicesCount,
      includeUserData: true,
    });
  }, [
    categoryFilter,
    fetchAllCategories,
    fetchInactiveCategories,
    limit,
    includeSubcategories,
    includeServicesCount,
  ]);

  const handleCategoryDelete = useCallback(
    (categoryId: string): void => {
      setSelectedCategories((prev) =>
        prev.filter((c) => c._id.toString() !== categoryId)
      );
      handleCategoryUpdate();
    },
    [handleCategoryUpdate]
  );

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!categoryToDelete) return;

    await handleAction(
      () => deleteCategory(categoryToDelete._id.toString()),
      `"${categoryToDelete.catName}" archived successfully`,
      "Failed to archive category"
    );

    setCategoryToDelete(null);
    setSelectedCategories((prev) =>
      prev.filter((c) => c._id !== categoryToDelete._id)
    );
  }, [handleAction, deleteCategory, categoryToDelete]);

  const confirmRestore = useCallback(async (): Promise<void> => {
    if (!categoryToRestore) return;

    await handleAction(
      () => restoreCategory(categoryToRestore._id.toString()),
      `"${categoryToRestore.catName}" restored successfully`,
      "Failed to restore category"
    );

    setCategoryToRestore(null);
    setSelectedCategories((prev) =>
      prev.filter((c) => c._id !== categoryToRestore._id)
    );
  }, [handleAction, restoreCategory, categoryToRestore]);

  const handleBulkArchive = useCallback(async (): Promise<void> => {
    if (!selectedCategories.length) return;

    const categoriesToArchive = selectedCategories.filter(
      (c) => c.isActive && !c.isDeleted
    );

    if (categoriesToArchive.length === 0) {
      toast.error("No active categories selected to archive");
      return;
    }

    await handleAction(
      () => bulkDelete(categoriesToArchive.map((c) => c._id.toString())),
      `${categoriesToArchive.length} categories archived successfully`,
      "Failed to archive categories"
    );

    setSelectedCategories([]);
  }, [selectedCategories, handleAction, bulkDelete]);

  const handleBulkRestore = useCallback(async (): Promise<void> => {
    if (!selectedCategories.length) return;

    const categoriesToRestore = selectedCategories.filter(
      (c) => !c.isActive || c.isDeleted
    );

    if (categoriesToRestore.length === 0) {
      toast.error("No inactive categories selected to restore");
      return;
    }

    await handleAction(
      () => bulkRestore(categoriesToRestore.map((c) => c._id.toString())),
      `${categoriesToRestore.length} categories restored successfully`,
      "Failed to restore categories"
    );

    setSelectedCategories([]);
  }, [selectedCategories, handleAction, bulkRestore]);

  const handleBulkToggleStatus = useCallback(async (): Promise<void> => {
    if (!selectedCategories.length) return;

    await handleAction(
      () => bulkToggleStatus(selectedCategories.map((c) => c._id.toString())),
      `${selectedCategories.length} categories status updated`,
      "Failed to update categories status"
    );

    setSelectedCategories([]);
  }, [selectedCategories, handleAction, bulkToggleStatus]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  if (error && displayCategories.length === 0) {
    return (
      <ErrorState
        title="Failed to load categories"
        message={error}
        onRetry={() => {
          clearError();
          handleFilterChange(categoryFilter);
        }}
      />
    );
  }

  if (isLoading && displayCategories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && displayCategories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No categories found for "${searchQuery}"`
              : categoryFilter === "active"
              ? `No active categories found${
                  allCategories.length > 0
                    ? ` (${allCategories.length} total)`
                    : ""
                }`
              : categoryFilter === "inactive"
              ? `No inactive categories found${
                  allCategories.length > 0
                    ? ` (${allCategories.length} active)`
                    : ""
                }`
              : "No categories found"}
          </p>
          <div className="flex items-center justify-center gap-3">
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  clearSearch();
                }}>
                Clear search
              </Button>
            )}
            {categoryFilter === "inactive" && (
              <Button
                variant="outline"
                onClick={() => handleFilterChange("inactive")}>
                Refresh Inactive
              </Button>
            )}
            <Button
              onClick={() => router.push("/admin/services/categories/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className={cn("space-y-6 w-full", className)}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {showSearch && (
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={handleFilterChange}
            disabled={isLoading}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({allCategories.length})</SelectItem>
              <SelectItem value="active">
                Active ({categories.filter((c) => c.isActive).length})
              </SelectItem>
              <SelectItem value="inactive">
                Inactive ({inactiveCount})
              </SelectItem>
            </SelectContent>
          </Select>

          {inactiveCount > 0 && categoryFilter !== "inactive" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("inactive")}
              className="text-orange-600 hover:text-orange-700">
              <Archive className="w-4 h-4 mr-1" />
              Inactive ({inactiveCount})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleAction(
                async () => {
                  clearSearch();
                  await refetch();
                },
                "Categories refreshed",
                "Failed to refresh"
              )
            }
            disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>

          <div className="flex border rounded-lg p-1">
            {(["list", "grid"] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="px-3"
                disabled={isLoading}>
                {mode === "list" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid className="w-4 h-4" />
                )}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => router.push("/admin/services/categories/create")}
            disabled={isLoading}>
            New
          </Button>
          <Button
            onClick={() => router.push("/admin/services/categories/deleted")}>
            Archived
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCategories.length > 0 && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedCategories.length} selected
              {selectedActiveCount > 0 &&
                selectedInactiveCount > 0 &&
                ` (${selectedActiveCount} active, ${selectedInactiveCount} inactive)`}
              {selectedActiveCount === 0 &&
                selectedInactiveCount > 0 &&
                ` (all inactive${selectedDeletedCount > 0 ? "/deleted" : ""})`}
              {selectedInactiveCount === 0 &&
                selectedActiveCount > 0 &&
                " (all active)"}
            </span>
            <div className="flex gap-2">
              {selectedInactiveCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRestore}
                  disabled={isLoading}
                  className="text-green-600 hover:text-green-700">
                  <ArchiveRestore className="w-4 h-4 mr-1" />
                  Restore ({selectedInactiveCount})
                </Button>
              )}

              {selectedCategories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkToggleStatus}
                  disabled={isLoading}>
                  Toggle Status
                </Button>
              )}

              {selectedActiveCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  disabled={isLoading}
                  className="text-orange-600 hover:text-orange-700">
                  <Archive className="w-4 h-4 mr-1" />
                  Archive ({selectedActiveCount})
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategories([])}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid/List */}
      <div
        className={
          viewMode === "list"
            ? "space-y-2"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        }>
        {displayCategories.map((category) => (
          <SharedCategoryCard
            key={category._id.toString()}
            category={category as CategoryVariant}
            preset={context}
            config={{
              viewMode,
              ...(categoryFilter === "inactive" && {
                availableActions: [
                  "explore",
                  "restore",
                ] as CategoryCardAction[],
                primaryAction: "explore" as CategoryCardAction,
              }),
            }}
            isSelected={isSelected(category)}
            onToggleSelection={toggleSelection}
            onAction={handleCategoryAction}
            onUpdate={handleCategoryUpdate}
            onDelete={handleCategoryDelete}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Category</AlertDialogTitle>
            <AlertDialogDescription>
              Archive &quot;{categoryToDelete?.catName}&quot;? This will move it
              to inactive status. You can restore it later from the inactive
              categories list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToRestore}
        onOpenChange={() => setCategoryToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Category</AlertDialogTitle>
            <AlertDialogDescription>
              Restore &quot;{categoryToRestore?.catName}&quot; to active status?
              This will make it visible and usable again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestore}
              className="bg-green-600 text-white hover:bg-green-700">
              <ArchiveRestore className="w-4 h-4 mr-1" />
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message="Processing..." />}
    </div>
  );
};

export default CategoryList;
