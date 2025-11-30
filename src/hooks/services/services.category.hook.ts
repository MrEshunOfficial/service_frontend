// hooks/useCategories.ts
import { useState, useEffect, useCallback } from "react";
import type {
  Category,
  CategoryWithServices,
  CategorySearchParams,
  CategoryStatsResponse,
  CategoryHierarchyNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkUpdateCategoryRequest,
} from "@/types/category.types";
import { categoryAPI } from "@/lib/api/services/services.categories.api";

// ============================================================================
// Base Hook State Types
// ============================================================================

interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseMutationState {
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// PUBLIC CATEGORY HOOKS
// ============================================================================

/**
 * Hook for fetching active categories
 */
export function useActiveCategories() {
  const [state, setState] = useState<UseQueryState<Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getActiveCategories();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { ...state, refetch: fetchCategories };
}

/**
 * Hook for fetching top-level categories
 */
export function useTopLevelCategories() {
  const [state, setState] = useState<UseQueryState<Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getTopLevelCategories();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { ...state, refetch: fetchCategories };
}

/**
 * Hook for fetching category hierarchy
 */
export function useCategoryHierarchy() {
  const [state, setState] = useState<UseQueryState<CategoryHierarchyNode[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchHierarchy = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getCategoryHierarchy();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  return { ...state, refetch: fetchHierarchy };
}

/**
 * Hook for searching categories
 */
export function useSearchCategories(initialParams?: CategorySearchParams) {
  const [state, setState] = useState<UseQueryState<CategoryWithServices[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const [params, setParams] = useState<CategorySearchParams | undefined>(initialParams);

  const search = useCallback(async (searchParams?: CategorySearchParams) => {
    const finalParams = searchParams || params;
    if (!finalParams) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.searchCategories(finalParams);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [params]);

  useEffect(() => {
    if (initialParams) {
      search(initialParams);
    }
  }, []);

  return { ...state, search, setParams };
}

/**
 * Hook for fetching a single category by ID
 */
export function useCategory(id?: string) {
  const [state, setState] = useState<UseQueryState<CategoryWithServices>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchCategory = useCallback(async (categoryId?: string) => {
    const finalId = categoryId || id;
    if (!finalId) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getCompleteCategory(finalId);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCategory(id);
    }
  }, [id, fetchCategory]);

  return { ...state, refetch: fetchCategory };
}

/**
 * Hook for fetching category by slug
 */
export function useCategoryBySlug(slug?: string) {
  const [state, setState] = useState<UseQueryState<CategoryWithServices>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchCategory = useCallback(async (categorySlug?: string) => {
    const finalSlug = categorySlug || slug;
    if (!finalSlug) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getCategoryBySlug(finalSlug);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchCategory(slug);
    }
  }, [slug, fetchCategory]);

  return { ...state, refetch: fetchCategory };
}

/**
 * Hook for fetching subcategories
 */
export function useSubcategories(parentId?: string) {
  const [state, setState] = useState<UseQueryState<Category[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchSubcategories = useCallback(async (categoryId?: string) => {
    const finalId = categoryId || parentId;
    if (!finalId) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getSubcategories(finalId);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [parentId]);

  useEffect(() => {
    if (parentId) {
      fetchSubcategories(parentId);
    }
  }, [parentId, fetchSubcategories]);

  return { ...state, refetch: fetchSubcategories };
}

/**
 * Hook for fetching all tags
 */
export function useCategoryTags() {
  const [state, setState] = useState<UseQueryState<string[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchTags = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getAllTags();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { ...state, refetch: fetchTags };
}

/**
 * Hook for fetching categories by tag
 */
export function useCategoriesByTag(tag?: string) {
  const [state, setState] = useState<UseQueryState<Category[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchCategories = useCallback(async (categoryTag?: string) => {
    const finalTag = categoryTag || tag;
    if (!finalTag) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getCategoriesByTag(finalTag);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [tag]);

  useEffect(() => {
    if (tag) {
      fetchCategories(tag);
    }
  }, [tag, fetchCategories]);

  return { ...state, refetch: fetchCategories };
}

/**
 * Hook for fetching category statistics
 */
export function useCategoryStats() {
  const [state, setState] = useState<UseQueryState<CategoryStatsResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getCategoryStats();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...state, refetch: fetchStats };
}

/**
 * Hook for fetching all categories (admin)
 */
export function useAllCategories(includeDeleted = false) {
  const [state, setState] = useState<UseQueryState<Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await categoryAPI.getAllCategories(includeDeleted);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [includeDeleted]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { ...state, refetch: fetchCategories };
}

/**
 * Hook for creating categories (admin)
 */
export function useCreateCategory() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const createCategory = useCallback(
    async (data: CreateCategoryRequest): Promise<Category | null> => {
      try {
        setState({ loading: true, error: null });
        const result = await categoryAPI.createCategory(data);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return null;
      }
    },
    []
  );

  return { ...state, createCategory };
}

/**
 * Hook for updating categories (admin)
 */
export function useUpdateCategory() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const updateCategory = useCallback(
    async (
      id: string,
      data: UpdateCategoryRequest
    ): Promise<Category | null> => {
      try {
        setState({ loading: true, error: null });
        const result = await categoryAPI.updateCategory(id, data);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return null;
      }
    },
    []
  );

  return { ...state, updateCategory };
}

/**
 * Hook for bulk updating categories (admin)
 */
export function useBulkUpdateCategories() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const bulkUpdate = useCallback(async (data: BulkUpdateCategoryRequest) => {
    try {
      setState({ loading: true, error: null });
      const result = await categoryAPI.bulkUpdateCategories(data);
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      setState({ loading: false, error: error as Error });
      return null;
    }
  }, []);

  return { ...state, bulkUpdate };
}

/**
 * Hook for deleting categories (admin)
 */
export function useDeleteCategory() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState({ loading: true, error: null });
      await categoryAPI.deleteCategory(id);
      setState({ loading: false, error: null });
      return true;
    } catch (error) {
      setState({ loading: false, error: error as Error });
      return false;
    }
  }, []);

  const permanentlyDelete = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setState({ loading: true, error: null });
        await categoryAPI.permanentlyDeleteCategory(id);
        setState({ loading: false, error: null });
        return true;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return false;
      }
    },
    []
  );

  return { ...state, deleteCategory, permanentlyDelete };
}

/**
 * Hook for restoring categories (admin)
 */
export function useRestoreCategory() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const restoreCategory = useCallback(
    async (id: string): Promise<Category | null> => {
      try {
        setState({ loading: true, error: null });
        const result = await categoryAPI.restoreCategory(id);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return null;
      }
    },
    []
  );

  return { ...state, restoreCategory };
}

/**
 * Hook for toggling category active status (admin)
 */
export function useToggleCategoryStatus() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const toggleStatus = useCallback(
    async (id: string): Promise<Category | null> => {
      try {
        setState({ loading: true, error: null });
        const result = await categoryAPI.toggleActiveStatus(id);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return null;
      }
    },
    []
  );

  return { ...state, toggleStatus };
}

/**
 * Hook for updating category cover image (admin)
 */
export function useUpdateCategoryCover() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const updateCover = useCallback(
    async (id: string, imageId: string): Promise<Category | null> => {
      try {
        setState({ loading: true, error: null });
        const result = await categoryAPI.updateCoverImage(id, imageId);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return null;
      }
    },
    []
  );

  return { ...state, updateCover };
}

/**
 * Hook for checking slug availability
 */
export function useSlugAvailability() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
  });

  const checkSlug = useCallback(
    async (slug: string, excludeCategoryId?: string) => {
      try {
        setState({ loading: true, error: null });
        const result = await categoryAPI.checkSlugAvailability(
          slug,
          excludeCategoryId
        );
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error });
        return null;
      }
    },
    []
  );

  return { ...state, checkSlug };
}

/**
 * Comprehensive admin hook with all mutations
 */
export function useCategoryAdmin() {
  const { createCategory, loading: creating, error: createError } = useCreateCategory();
  const { updateCategory, loading: updating, error: updateError } = useUpdateCategory();
  const { deleteCategory, permanentlyDelete, loading: deleting, error: deleteError } = useDeleteCategory();
  const { restoreCategory, loading: restoring, error: restoreError } = useRestoreCategory();
  const { toggleStatus, loading: toggling, error: toggleError } = useToggleCategoryStatus();
  const { updateCover, loading: updatingCover, error: coverError } = useUpdateCategoryCover();
  const { bulkUpdate, loading: bulkUpdating, error: bulkError } = useBulkUpdateCategories();

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    permanentlyDelete,
    restoreCategory,
    toggleStatus,
    updateCover,
    bulkUpdate,
    loading: creating || updating || deleting || restoring || toggling || updatingCover || bulkUpdating,
    error: createError || updateError || deleteError || restoreError || toggleError || coverError || bulkError,
  };
}