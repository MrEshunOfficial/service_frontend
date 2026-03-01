// hooks/useServices.ts
import { useState, useEffect, useCallback, useRef } from "react";

import type { Service } from "@/types/service.types";
import {
  ServiceFilters,
  serviceAPI,
  SearchServicesParams,
  AccessibilityResponse,
  ServiceStats,
  ServiceImageStatus,
  CreateServiceData,
  UpdateServiceData,
  UpdateCoverImageData,
  RejectServiceData,
  RepairCoverLinksData,
  BulkUpdateServicesData,
  ReassignProviderData,
} from "@/lib/api/services/service.api";

// ── State types ───────────────────────────────────────────────────────────────

interface UseServicesState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UsePaginatedServicesState {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
}

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// ── Query hooks (data fetching) ───────────────────────────────────────────────

/**
 * Hook to fetch public services with optional filters
 */
export function usePublicServices(filters?: ServiceFilters) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const fetchServices = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getPublicServices(filters);
      setState({
        services: data.services ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        limit: data.limit ?? 10,
        totalPages: data.totalPages ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        services: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        loading: false,
        error: err as Error,
      });
    }
  }, [
    filters?.page,
    filters?.limit,
    filters?.categoryId,
    filters?.tags,
    filters?.sortBy,
    filters?.sortOrder,
  ]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch a service by slug (public)
 */
export function useServiceBySlug(slug: string) {
  const [state, setState] = useState<UseServicesState<Service>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchService = useCallback(async () => {
    if (!slug) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await serviceAPI.getServiceBySlug(slug);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [slug]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  return { ...state, refetch: fetchService };
}

/**
 * Hook to fetch a service by ID
 */
export function useServiceById(id: string) {
  const [state, setState] = useState<UseServicesState<Service>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchService = useCallback(async () => {
    if (!id) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await serviceAPI.getServiceById(id);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  return { ...state, refetch: fetchService };
}

/**
 * Hook to fetch complete service details including resolved cover image URL
 */
export function useCompleteService(id: string) {
  const [state, setState] = useState<UseServicesState<Service>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchService = useCallback(async () => {
    if (!id) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await serviceAPI.getCompleteService(id);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  return { ...state, refetch: fetchService };
}

/**
 * Hook to search services with full-text search
 */
export function useSearchServices(params: SearchServicesParams) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const searchServices = useCallback(async () => {
    if (!paramsRef.current.q) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.searchServices(paramsRef.current);
      setState({
        services: data.services,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  }, []);

  useEffect(() => {
    searchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { ...state, refetch: searchServices };
}

/**
 * Hook to fetch services accessible to the current user
 */
export function useAccessibleServices(filters?: ServiceFilters) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchServices = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getAccessibleServices(filtersRef.current);
      setState({
        services: data.services,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch a single service (alias for useServiceById with a cleaner name)
 */
export function useService(id: string) {
  return useServiceById(id);
}

/**
 * Hook to fetch services by category
 */
export function useServicesByCategory(
  categoryId: string,
  filters?: Pick<ServiceFilters, "page" | "limit" | "sortBy" | "sortOrder">
) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchServices = useCallback(async () => {
    if (!categoryId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getServicesByCategory(
        categoryId,
        filtersRef.current
      );
      setState({
        services: data.services,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  }, [categoryId]);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchServices, JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch all services belonging to a single provider.
 * A service has exactly one provider — this returns all services for that provider.
 */
export function useServicesByProvider(
  providerId: string,
  filters?: Pick<ServiceFilters, "page" | "limit" | "sortBy" | "sortOrder"> & {
    includeInactive?: boolean;
  }
) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchServices = useCallback(async () => {
    if (!providerId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getServicesByProvider(
        providerId,
        filtersRef.current
      );
      setState({
        services: data.services,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  }, [providerId]);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchServices, JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to check whether the current user can access a service
 */
export function useServiceAccessibility(id: string) {
  const [state, setState] = useState<UseServicesState<AccessibilityResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const checkAccessibility = useCallback(async () => {
    if (!id) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await serviceAPI.checkServiceAccessibility(id);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [id]);

  useEffect(() => {
    checkAccessibility();
  }, [checkAccessibility]);

  return { ...state, refetch: checkAccessibility };
}

// ── Admin query hooks ─────────────────────────────────────────────────────────

/**
 * Hook to fetch pending services awaiting moderation (admin only)
 */
export function usePendingServices(
  filters?: Pick<ServiceFilters, "page" | "limit" | "sortBy" | "sortOrder">
) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchServices = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getPendingServices(filtersRef.current);
      setState({
        services: data.services,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch all services (admin view)
 */
export function useAllServices(filters?: ServiceFilters) {
  const [state, setState] = useState<UsePaginatedServicesState>({
    services: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchServices = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getAllServices(filtersRef.current);
      setState({
        services: data.services,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch service statistics (admin only)
 */
export function useServiceStats() {
  const [state, setState] = useState<UseServicesState<ServiceStats>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await serviceAPI.getServiceStats();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...state, refetch: fetchStats };
}

/**
 * Hook to fetch cover image link status for a service (admin / debugging)
 */
export function useServiceImageStatus(id: string) {
  const [state, setState] = useState<UseServicesState<ServiceImageStatus>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchStatus = useCallback(async () => {
    if (!id) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await serviceAPI.getServiceImageStatus(id);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [id]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { ...state, refetch: fetchStatus };
}

// ── Mutation hooks (data modification) ───────────────────────────────────────

/**
 * Hook to create a service.
 * When `providerId` is included in `data`, the server automatically links
 * the service to the provider's `serviceOfferings`.
 */
export function useCreateService() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const createService = async (data: CreateServiceData) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.createService(data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, createService };
}

/**
 * Hook to update a service
 */
export function useUpdateService() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateService = async (id: string, data: UpdateServiceData) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.updateService(id, data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, updateService };
}

/**
 * Hook to reassign a service to a different provider (admin or owner).
 * The server handles unlinking from the old provider and linking to the new one.
 */
export function useReassignProvider() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const reassignProvider = async (
    serviceId: string,
    data: ReassignProviderData
  ) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.reassignProvider(serviceId, data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, reassignProvider };
}

/**
 * Hook to update a service cover image.
 * Pass `{ coverImageId: null }` to unlink the current image.
 */
export function useUpdateCoverImage() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateCoverImage = async (id: string, data: UpdateCoverImageData) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.updateCoverImage(id, data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, updateCoverImage };
}

/**
 * Hook to soft-delete a service
 */
export function useDeleteService() {
  const [state, setState] = useState<MutationState<{ message: string }>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteService = async (id: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.deleteService(id);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, deleteService };
}

/**
 * Hook to approve a service (admin only)
 */
export function useApproveService() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const approveService = async (id: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.approveService(id);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, approveService };
}

/**
 * Hook to reject a service with a reason (admin only)
 */
export function useRejectService() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const rejectService = async (id: string, data: RejectServiceData) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.rejectService(id, data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, rejectService };
}

/**
 * Hook to restore a soft-deleted service (admin only).
 * The server re-adds the service to its provider's serviceOfferings.
 */
export function useRestoreService() {
  const [state, setState] = useState<MutationState<Service>>({
    data: null,
    loading: false,
    error: null,
  });

  const restoreService = async (id: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.restoreService(id);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, restoreService };
}

/**
 * Hook to repair broken cover image links (admin only)
 */
export function useRepairServiceCoverLinks() {
  const [state, setState] = useState<
    MutationState<{ message: string; repaired: number }>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const repairCoverLinks = async (data?: RepairCoverLinksData) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.repairServiceCoverLinks(data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, repairCoverLinks };
}

/**
 * Hook to bulk update multiple services (admin only)
 */
export function useBulkUpdateServices() {
  const [state, setState] = useState<
    MutationState<{ message: string; updated: number }>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const bulkUpdateServices = async (data: BulkUpdateServicesData) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await serviceAPI.bulkUpdateServices(data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, bulkUpdateServices };
}