// hooks/useCategory.ts
import { categoryAPI } from "@/lib/api/service-categories/categories.api";
import { Category, CategoryWithServices } from "@/types/category.types";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook state types
 */
interface UseHookState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UsePaginatedHookState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  } | null;
}

/**
 * Hook options
 */
interface UseHookOptions {
  autoFetch?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UsePaginationOptions extends UseHookOptions {
  limit?: number;
  skip?: number;
}

/**
 * Custom hook to use stable callback references
 */
const useCallbackRef = <T extends (...args: never[]) => unknown>(
  callback: T | undefined
): T => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current?.(...args);
    }) as T,
    []
  );
};

// ============================================================================
// CRUD Hooks
// ============================================================================

/**
 * Hook for creating a category
 */
export const useCreateCategory = (options?: UseHookOptions) => {
  const [state, setState] = useState<UseHookState<Category>>({
    data: null,
    loading: false,
    error: null,
  });

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const createCategory = useCallback(
    async (data: Parameters<typeof categoryAPI.createCategory>[0]) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await categoryAPI.createCategory(data);
        setState({ data: response.data, loading: false, error: null });
        onSuccessRef(response.data);
        return response.data;
      } catch (error) {
        const err = error as Error;
        setState({ data: null, loading: false, error: err });
        onErrorRef(err);
        throw error;
      }
    },
    [onSuccessRef, onErrorRef]
  );

  return { ...state, createCategory };
};

/**
 * Hook for updating a category
 */
export const useUpdateCategory = (options?: UseHookOptions) => {
  const [state, setState] = useState<UseHookState<Category>>({
    data: null,
    loading: false,
    error: null,
  });

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const updateCategory = useCallback(
    async (
      id: string,
      data: Parameters<typeof categoryAPI.updateCategory>[1]
    ) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await categoryAPI.updateCategory(id, data);
        setState({ data: response.data, loading: false, error: null });
        onSuccessRef(response.data);
        return response.data;
      } catch (error) {
        const err = error as Error;
        setState({ data: null, loading: false, error: err });
        onErrorRef(err);
        throw error;
      }
    },
    [onSuccessRef, onErrorRef]
  );

  return { ...state, updateCategory };
};

/**
 * Hook for deleting a category
 */
export const useDeleteCategory = (options?: UseHookOptions) => {
  const [state, setState] = useState<UseHookState<void>>({
    data: null,
    loading: false,
    error: null,
  });

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const deleteCategory = useCallback(
    async (id: string) => {
      setState({ data: null, loading: true, error: null });
      try {
        await categoryAPI.deleteCategory(id);
        setState({ data: null, loading: false, error: null });
        onSuccessRef(id);
      } catch (error) {
        const err = error as Error;
        setState({ data: null, loading: false, error: err });
        onErrorRef(err);
        throw error;
      }
    },
    [onSuccessRef, onErrorRef]
  );

  return { ...state, deleteCategory };
};

// ============================================================================
// Retrieval Hooks with Auto-fetch
// ============================================================================

/**
 * Hook for fetching a category by ID
 */
export const useCategoryById = (
  id: string | null,
  options?: UseHookOptions & { includeDetails?: boolean }
) => {
  const [state, setState] = useState<UseHookState<Category>>({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true, includeDetails } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategory = useCallback(async () => {
    if (!id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getCategoryById(id, includeDetails);
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [id, includeDetails, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchCategory();
    }
  }, [fetchCategory, autoFetch, id]);

  return { ...state, refetch: fetchCategory };
};

/**
 * Hook for fetching a category by slug
 */
export const useCategoryBySlug = (
  slug: string | null,
  options?: UseHookOptions & { includeDetails?: boolean }
) => {
  const [state, setState] = useState<UseHookState<Category>>({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true, includeDetails } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategory = useCallback(async () => {
    if (!slug) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getCategoryBySlug(
        slug,
        includeDetails
      );
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [slug, includeDetails, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch && slug) {
      fetchCategory();
    }
  }, [fetchCategory, autoFetch, slug]);

  return { ...state, refetch: fetchCategory };
};

/**
 * Hook for fetching complete category with cover image
 */
export const useCompleteCategory = (
  id: string | null,
  options?: UseHookOptions
) => {
  const [state, setState] = useState<
    UseHookState<{
      category: Category;
      coverImageUrl?: string;
    }>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategory = useCallback(async () => {
    if (!id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getCompleteCategory(id);
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [id, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchCategory();
    }
  }, [fetchCategory, autoFetch, id]);

  return { ...state, refetch: fetchCategory };
};

/**
 * Hook for fetching active categories with pagination
 */
export const useActiveCategories = (options?: UsePaginationOptions) => {
  const [state, setState] = useState<UsePaginatedHookState<Category>>({
    data: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const { limit, skip, autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getActiveCategories({
        limit,
        skip,
      });
      setState({
        data: response.data,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: [], loading: false, error: err, pagination: null });
      onErrorRef(err);
    }
  }, [limit, skip, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [fetchCategories, autoFetch]);

  return { ...state, refetch: fetchCategories };
};

/**
 * Hook for fetching top-level categories
 */
export const useTopLevelCategories = (
  options?: UseHookOptions & { includeSubcategories?: boolean }
) => {
  const [state, setState] = useState<UseHookState<CategoryWithServices[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true, includeSubcategories } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getTopLevelCategories(
        includeSubcategories
      );
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [includeSubcategories, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [fetchCategories, autoFetch]);

  return { ...state, refetch: fetchCategories };
};

/**
 * Hook for fetching subcategories
 */
export const useSubcategories = (
  id: string | null,
  options?: UseHookOptions
) => {
  const [state, setState] = useState<UseHookState<CategoryWithServices[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchSubcategories = useCallback(async () => {
    if (!id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getSubcategories(id);
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [id, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchSubcategories();
    }
  }, [fetchSubcategories, autoFetch, id]);

  return { ...state, refetch: fetchSubcategories };
};

/**
 * Hook for fetching category hierarchy
 */
export const useCategoryHierarchy = (options?: UseHookOptions) => {
  const [state, setState] = useState<UseHookState<CategoryWithServices[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchHierarchy = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getCategoryHierarchy();
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch) {
      fetchHierarchy();
    }
  }, [fetchHierarchy, autoFetch]);

  return { ...state, refetch: fetchHierarchy };
};

/**
 * Hook for searching categories
 */
export const useSearchCategories = (
  query: string | null,
  options?: UsePaginationOptions & { activeOnly?: boolean }
) => {
  const [state, setState] = useState<UsePaginatedHookState<Category>>({
    data: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const { limit, skip, activeOnly, autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const searchCategories = useCallback(async () => {
    if (!query) {
      setState({ data: [], loading: false, error: null, pagination: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.searchCategories({
        q: query,
        limit,
        skip,
        activeOnly,
      });
      setState({
        data: response.data,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: [], loading: false, error: err, pagination: null });
      onErrorRef(err);
    }
  }, [query, limit, skip, activeOnly, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch && query) {
      searchCategories();
    }
  }, [searchCategories, autoFetch, query]);

  return { ...state, refetch: searchCategories };
};

/**
 * Hook for fetching categories by tag
 */
export const useCategoriesByTag = (
  tag: string | null,
  options?: UsePaginationOptions
) => {
  const [state, setState] = useState<UsePaginatedHookState<Category>>({
    data: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const { limit, skip, autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategories = useCallback(async () => {
    if (!tag) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getCategoriesByTag(tag, {
        limit,
        skip,
      });
      setState({
        data: response.data,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: [], loading: false, error: err, pagination: null });
      onErrorRef(err);
    }
  }, [tag, limit, skip, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch && tag) {
      fetchCategories();
    }
  }, [fetchCategories, autoFetch, tag]);

  return { ...state, refetch: fetchCategories };
};

/**
 * Hook for fetching all tags
 */
export const useAllTags = (options?: UseHookOptions) => {
  const [state, setState] = useState<UseHookState<string[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchTags = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getAllTags();
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch) {
      fetchTags();
    }
  }, [fetchTags, autoFetch]);

  return { ...state, refetch: fetchTags };
};

// ============================================================================
// Admin Hooks
// ============================================================================

/**
 * Hook for fetching all categories (admin)
 */
export const useAllCategories = (
  options?: UsePaginationOptions & { includeDeleted?: boolean }
) => {
  const [state, setState] = useState<UsePaginatedHookState<Category>>({
    data: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const { limit, skip, includeDeleted, autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getAllCategories({
        limit,
        skip,
        includeDeleted,
      });
      setState({
        data: response.data,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: [], loading: false, error: err, pagination: null });
      onErrorRef(err);
    }
  }, [limit, skip, includeDeleted, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [fetchCategories, autoFetch]);

  return { ...state, refetch: fetchCategories };
};

/**
 * Hook for fetching category statistics
 */
export const useCategoryStats = (
  categoryId?: string | null,
  options?: UseHookOptions
) => {
  const [state, setState] = useState<
    UseHookState<{
      totalCategories: number;
      activeCategories: number;
      deletedCategories: number;
      categoriesWithServices?: number;
      topCategories?: Array<{
        _id: string;
        catName: string;
        servicesCount: number;
      }>;
    }>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const { autoFetch = true } = options ?? {};

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoryAPI.getCategoryStats(
        categoryId || undefined
      );
      setState({ data: response.data, loading: false, error: null });
      onSuccessRef(response.data);
    } catch (error) {
      const err = error as Error;
      setState({ data: null, loading: false, error: err });
      onErrorRef(err);
    }
  }, [categoryId, onSuccessRef, onErrorRef]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);

  return { ...state, refetch: fetchStats };
};

/**
 * Hook for checking slug availability
 */
export const useCheckSlugAvailability = () => {
  const [state, setState] = useState<UseHookState<{ available: boolean }>>({
    data: null,
    loading: false,
    error: null,
  });

  const checkSlug = useCallback(
    async (slug: string, excludeCategoryId?: string) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await categoryAPI.checkSlugAvailability(
          slug,
          excludeCategoryId
        );
        setState({ data: response.data, loading: false, error: null });
        return response.data.available;
      } catch (error) {
        const err = error as Error;
        setState({ data: null, loading: false, error: err });
        throw error;
      }
    },
    []
  );

  return { ...state, checkSlug };
};

/**
 * Hook for toggling category active status
 */
export const useToggleActiveStatus = (options?: UseHookOptions) => {
  const [state, setState] = useState<UseHookState<Category>>({
    data: null,
    loading: false,
    error: null,
  });

  const onSuccessRef = useCallbackRef(options?.onSuccess);
  const onErrorRef = useCallbackRef(options?.onError);

  const toggleStatus = useCallback(
    async (id: string) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await categoryAPI.toggleActiveStatus(id);
        setState({ data: response.data, loading: false, error: null });
        onSuccessRef(response.data);
        return response.data;
      } catch (error) {
        const err = error as Error;
        setState({ data: null, loading: false, error: err });
        onErrorRef(err);
        throw error;
      }
    },
    [onSuccessRef, onErrorRef]
  );

  return { ...state, toggleStatus };
};
