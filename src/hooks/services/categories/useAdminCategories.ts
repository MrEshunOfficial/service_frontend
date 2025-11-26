// hooks/useServiceCategories.ts or hooks/useAdminCategory.ts
import { useState, useCallback, useEffect } from "react";
import { Category } from "@/types/category.types";
import { categoryAPI } from "@/lib/api/service-categories/categories.api";

interface AdminCategoryParams {
  limit?: number;
  includeSubcategories?: boolean;
  includeServicesCount?: boolean;
  includeUserData?: boolean;
}

interface UseAdminCategoryOptions {
  autoFetchOnMount?: boolean;
  defaultParams?: AdminCategoryParams;
  includeInactive?: boolean;
}

export const useAdminCategory = (options: UseAdminCategoryOptions = {}) => {
  const {
    autoFetchOnMount = true,
    defaultParams = {},
    includeInactive = true,
  } = options;

  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [inactiveCategories, setInactiveCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCategories = useCallback(
    async (params?: AdminCategoryParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await categoryAPI.getAllCategories({
          ...defaultParams,
          ...params,
          includeDeleted: includeInactive,
        });
        setAllCategories(response.data);
        setCategories(response.data.filter((c) => c.isActive && !c.isDeleted));
        return response.data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch categories";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultParams, includeInactive]
  );

  const fetchInactiveCategories = useCallback(
    async (params?: AdminCategoryParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await categoryAPI.getAllCategories({
          ...defaultParams,
          ...params,
          includeDeleted: true,
        });
        const inactive = response.data.filter(
          (c) => !c.isActive || c.isDeleted
        );
        setInactiveCategories(inactive);
        return inactive;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to fetch inactive categories";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultParams]
  );

  const searchAllCategories = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await categoryAPI.searchCategories({
          q: query,
          limit: limit || defaultParams.limit,
          activeOnly: false,
        });
        setSearchResults(response.data);
        return response.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Search failed";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultParams.limit]
  );

  const searchInactiveCategories = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await categoryAPI.searchCategories({
          q: query,
          limit: limit || defaultParams.limit,
          activeOnly: false,
        });
        const inactive = response.data.filter(
          (c) => !c.isActive || c.isDeleted
        );
        setSearchResults(inactive);
        return inactive;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Search failed";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultParams.limit]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await categoryAPI.deleteCategory(id);
      // Update local state
      setCategories((prev) => prev.filter((c) => c._id.toString() !== id));
      setAllCategories((prev) =>
        prev.map((c) =>
          c._id.toString() === id
            ? { ...c, isActive: false, isDeleted: true }
            : c
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Delete failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreCategory = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.toggleActiveStatus(id);
      // Update local state
      setAllCategories((prev) =>
        prev.map((c) => (c._id.toString() === id ? response.data : c))
      );
      setInactiveCategories((prev) =>
        prev.filter((c) => c._id.toString() !== id)
      );
      if (response.data.isActive) {
        setCategories((prev) => [...prev, response.data]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Restore failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all(ids.map((id) => categoryAPI.deleteCategory(id)));
      setCategories((prev) =>
        prev.filter((c) => !ids.includes(c._id.toString()))
      );
      setAllCategories((prev) =>
        prev.map((c) =>
          ids.includes(c._id.toString())
            ? { ...c, isActive: false, isDeleted: true }
            : c
        )
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Bulk delete failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkRestore = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(
        ids.map((id) => categoryAPI.toggleActiveStatus(id))
      );
      const restoredCategories = responses.map((r) => r.data);
      setAllCategories((prev) =>
        prev.map((c) => {
          const restored = restoredCategories.find((r) => r._id === c._id);
          return restored || c;
        })
      );
      setInactiveCategories((prev) =>
        prev.filter((c) => !ids.includes(c._id.toString()))
      );
      setCategories((prev) => [
        ...prev,
        ...restoredCategories.filter((c) => c.isActive),
      ]);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Bulk restore failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkToggleStatus = useCallback(
    async (ids: string[]) => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all(ids.map((id) => categoryAPI.toggleActiveStatus(id)));
        await fetchAllCategories();
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Bulk toggle failed";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAllCategories]
  );

  const clearError = useCallback(() => setError(null), []);

  const refetch = useCallback(async () => {
    await fetchAllCategories();
    if (includeInactive) {
      await fetchInactiveCategories();
    }
  }, [fetchAllCategories, fetchInactiveCategories, includeInactive]);

  useEffect(() => {
    if (autoFetchOnMount) {
      fetchAllCategories();
    }
  }, [autoFetchOnMount, fetchAllCategories]);

  return {
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
  };
};
