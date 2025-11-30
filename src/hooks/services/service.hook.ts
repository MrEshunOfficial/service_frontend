// hooks/useServices.ts
import { useState, useEffect, useCallback, useRef } from "react";

import type { Service } from "@/types/service.types";
import { ServiceFilters, serviceAPI, SearchServicesParams, AccessibilityResponse, ServiceStats, ServiceImageStatus, CreateServiceData, UpdateServiceData, UpdateCoverImageData, RejectServiceData, RepairCoverLinksData, BulkUpdateServicesData } from "@/lib/api/services/service.api";

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

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch public services
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

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchServices = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAPI.getPublicServices(filtersRef.current);
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
      console.error("Error fetching public services:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch a service by slug
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
 * Hook to search services
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    searchServices();
  }, [JSON.stringify(params)]);

  return { ...state, refetch: searchServices };
}

/**
 * Hook to fetch accessible services
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch a service by ID
 */
export function useService(id: string) {
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
 * Hook to fetch complete service with full details
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
      const data = await serviceAPI.getServicesByCategory(categoryId, filtersRef.current);
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, [categoryId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices, JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch services by provider
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
      const data = await serviceAPI.getServicesByProvider(providerId, filtersRef.current);
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, [providerId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices, JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to check service accessibility
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

// ============================================
// ADMIN QUERY HOOKS
// ============================================

/**
 * Hook to fetch pending services (admin only)
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [JSON.stringify(filters)]);

  return { ...state, refetch: fetchServices };
}

/**
 * Hook to fetch all services (admin only)
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
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
 * Hook to fetch service image status (admin only)
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

// ============================================
// MUTATION HOOKS (Data Modification)
// ============================================

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to create a service
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
 * Hook to update service cover image
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
 * Hook to delete a service
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
 * Hook to reject a service (admin only)
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
 * Hook to restore a service (admin only)
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
 * Hook to repair service cover links (admin only)
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
 * Hook to bulk update services (admin only)
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