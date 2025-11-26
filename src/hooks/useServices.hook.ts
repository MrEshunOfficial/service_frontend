// hooks/useServices.ts

import { serviceAPI } from "@/lib/api/services/services.api";
import {
  ServiceSearchFilters,
  PaginationOptions,
  PopulationLevel,
  Service,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceQueryResult,
} from "@/types/service.types";
import { useState, useEffect, useCallback, useRef } from "react";

// ============================================
// TYPES
// ============================================

interface UseServicesOptions {
  filters?: ServiceSearchFilters;
  pagination?: PaginationOptions;
  populationLevel?: PopulationLevel;
  autoLoad?: boolean;
  publicOnly?: boolean;
}

interface UseServicesReturn {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: ServiceSearchFilters) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

interface UseServiceOptions {
  populationLevel?: PopulationLevel;
  autoLoad?: boolean;
}

interface UseServiceReturn {
  service: Service | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

interface UseServiceMutationsReturn {
  createService: (data: CreateServiceDTO) => Promise<Service>;
  updateService: (id: string, data: UpdateServiceDTO) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  approveService: (id: string) => Promise<Service>;
  rejectService: (id: string, reason: string) => Promise<Service>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

function isError(e: unknown): e is { message: string } {
  return typeof e === "object" && e !== null && "message" in e;
}

// ============================================
// HOOK: useServices (Multiple Services)
// ============================================

export function useServices(
  options: UseServicesOptions = {}
): UseServicesReturn {
  const {
    filters: initialFilters = {},
    pagination: initialPagination,
    populationLevel = PopulationLevel.MINIMAL,
    autoLoad = true,
    publicOnly = false,
  } = options;

  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(initialPagination?.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] =
    useState<ServiceSearchFilters>(initialFilters);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchServices = useCallback(
    async (currentPage: number, append: boolean = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const pagination: PaginationOptions = {
          ...initialPagination,
          page: currentPage,
        };

        let result: ServiceQueryResult;

        if (publicOnly) {
          result = await serviceAPI.getPublicServices(
            filters,
            pagination,
            populationLevel
          );
        } else {
          result = await serviceAPI.getAccessibleServices(
            filters,
            pagination,
            populationLevel
          );
        }

        if (!isMountedRef.current) return;

        if (append) {
          setServices((prev) => [...prev, ...result.services]);
        } else {
          setServices(result.services);
        }

        setTotal(result.total);
        setPageState(result.page);
        setTotalPages(result.totalPages);
        setHasMore(result.hasMore);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "AbortError") return;
        }

        if (!isMountedRef.current) return;

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch services. Please try again.";

        setError(errorMessage);
        console.error("Error fetching services:", err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [filters, initialPagination, populationLevel, publicOnly]
  );

  const refresh = useCallback(async () => {
    await fetchServices(1, false);
  }, [fetchServices]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchServices(page + 1, true);
  }, [hasMore, loading, page, fetchServices]);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setFilters = useCallback((newFilters: ServiceSearchFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (autoLoad) {
      fetchServices(page, false);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoLoad, filters, page, fetchServices]);

  return {
    services,
    total,
    page,
    totalPages,
    hasMore,
    loading,
    error,
    refresh,
    loadMore,
    setFilters,
    setPage,
    clearError,
  };
}

// ============================================
// HOOK: useService (Single Service)
// ============================================

export function useService(
  idOrSlug: string | undefined,
  options: UseServiceOptions = {}
): UseServiceReturn {
  const { populationLevel = PopulationLevel.DETAILED, autoLoad = true } =
    options;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchService = useCallback(async () => {
    if (!idOrSlug) return;

    try {
      setLoading(true);
      setError(null);

      let result: Service;

      // Detect if it's a slug (contains hyphens) or an ID
      if (idOrSlug.includes("-")) {
        result = await serviceAPI.getServiceBySlug(idOrSlug, populationLevel);
      } else {
        result = await serviceAPI.getServiceById(idOrSlug, populationLevel);
      }

      if (!isMountedRef.current) return;

      setService(result);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;

      const errorMessage = isError(err)
        ? err.message
        : "Failed to fetch service. Please try again.";
      setError(errorMessage);
      console.error("Error fetching service:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [idOrSlug, populationLevel]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (autoLoad && idOrSlug) {
      fetchService();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, idOrSlug, fetchService]);

  return {
    service,
    loading,
    error,
    refresh: fetchService,
    clearError,
  };
}

// ============================================
// HOOK: useServiceMutations
// ============================================

export function useServiceMutations(): UseServiceMutationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createService = useCallback(
    async (data: CreateServiceDTO): Promise<Service> => {
      try {
        setLoading(true);
        setError(null);
        const result = await serviceAPI.createService(data);
        return result;
      } catch (err: unknown) {
        const errorMessage = isError(err)
          ? err.message
          : "Failed to create service. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateService = useCallback(
    async (id: string, data: UpdateServiceDTO): Promise<Service> => {
      try {
        setLoading(true);
        setError(null);
        const result = await serviceAPI.updateService(id, data);
        return result;
      } catch (err: unknown) {
        const errorMessage = isError(err)
          ? err.message
          : "Failed to update service. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteService = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await serviceAPI.deleteService(id);
    } catch (err: unknown) {
      const errorMessage = isError(err)
        ? err.message
        : "Failed to delete service. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveService = useCallback(async (id: string): Promise<Service> => {
    try {
      setLoading(true);
      setError(null);
      const result = await serviceAPI.approveService(id);
      return result;
    } catch (err: unknown) {
      const errorMessage = isError(err)
        ? err.message
        : "Failed to approve service. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectService = useCallback(
    async (id: string, reason: string): Promise<Service> => {
      try {
        setLoading(true);
        setError(null);
        const result = await serviceAPI.rejectService(id, reason);
        return result;
      } catch (err: unknown) {
        const errorMessage = isError(err)
          ? err.message
          : "Failed to reject service. Please try again.";

        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createService,
    updateService,
    deleteService,
    approveService,
    rejectService,
    loading,
    error,
    clearError,
  };
}
