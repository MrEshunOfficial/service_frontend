// hooks/profiles/useprovider.profile.hook.ts

import { AddServiceRequest, Coordinates, CreateProviderProfileRequest, DistanceResult, FindNearestProvidersRequest, FindProvidersByLocationParams, NearestProviderResult, providerAPI, ProviderProfile, SearchProvidersRequest, UpdateProviderProfileRequest } from "@/lib/api/profiles/provider.profile.api";
import { Service } from "@/types/service.types";
import { useState, useEffect, useCallback, useRef } from "react";

interface UseProviderState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UsePaginatedProvidersState {
  providers: ProviderProfile[];
  total: number;
  count: number;
  loading: boolean;
  error: Error | null;
}

interface UseNearestProvidersState {
  providers: NearestProviderResult[];
  loading: boolean;
  error: Error | null;
}

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to get current user's provider profile
 */
export function useMyProviderProfile() {
  const [state, setState] = useState<UseProviderState<ProviderProfile>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await providerAPI.getMyProviderProfile();
      setState({ data, loading: false, error: null });
    } catch (err) {
      console.error("Error fetching provider profile:", err);
      setState({ data: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { ...state, refetch: fetchProfile };
}

/**
 * Hook to check if user has a provider profile
 */
export function useHasProviderProfile() {
  const [state, setState] = useState<UseProviderState<boolean>>({
    data: null,
    loading: true,
    error: null,
  });

  const checkProfile = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const hasProfile = await providerAPI.hasProviderProfile();
      setState({ data: hasProfile, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  return { ...state, refetch: checkProfile };
}

/**
 * Hook to fetch a provider profile by ID
 */
export function useProviderProfile(providerId: string) {
  const [state, setState] = useState<UseProviderState<ProviderProfile>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async () => {
    if (!providerId) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await providerAPI.getProviderProfile(providerId);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [providerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { ...state, refetch: fetchProfile };
}

/**
 * Hook to fetch a provider profile by user profile ID
 */
export function useProviderByProfile(profileId: string) {
  const [state, setState] = useState<UseProviderState<ProviderProfile>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async () => {
    if (!profileId) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await providerAPI.getProviderByProfile(profileId);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { ...state, refetch: fetchProfile };
}

/**
 * Hook to find nearest providers to a location
 */
export function useNearestProviders(request: FindNearestProvidersRequest) {
  const [state, setState] = useState<UseNearestProvidersState>({
    providers: [],
    loading: true,
    error: null,
  });

  const requestRef = useRef(request);
  requestRef.current = request;

  const fetchProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await providerAPI.findNearestProviders(requestRef.current);
      setState({
        providers: data,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching nearest providers:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    if (request.latitude && request.longitude) {
      fetchProviders();
    }
  }, [JSON.stringify(request), fetchProviders]);

  return { ...state, refetch: fetchProviders };
}

/**
 * Hook to find providers near current user location
 */
export function useProvidersNearMe(
  options?: Omit<FindNearestProvidersRequest, "latitude" | "longitude">
) {
  const [state, setState] = useState<UseNearestProvidersState>({
    providers: [],
    loading: true,
    error: null,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await providerAPI.findProvidersNearMe(optionsRef.current);
      setState({
        providers: data,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching providers near me:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [JSON.stringify(options), fetchProviders]);

  return { ...state, refetch: fetchProviders };
}

/**
 * Hook to find providers by location (region/city)
 */
export function useProvidersByLocation(params: FindProvidersByLocationParams) {
  const [state, setState] = useState<UseProviderState<ProviderProfile[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await providerAPI.findProvidersByLocation(paramsRef.current);
      setState({
        data,
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
    fetchProviders();
  }, [JSON.stringify(params), fetchProviders]);

  return { ...state, refetch: fetchProviders };
}

/**
 * Hook to search providers with filters
 */
export function useSearchProviders(request: SearchProvidersRequest) {
  const [state, setState] = useState<UsePaginatedProvidersState>({
    providers: [],
    total: 0,
    count: 0,
    loading: true,
    error: null,
  });

  const requestRef = useRef(request);
  requestRef.current = request;

  const searchProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await providerAPI.searchProviders(requestRef.current);
      setState({
        providers: data.providers,
        total: data.total,
        count: data.count,
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
    searchProviders();
  }, [JSON.stringify(request), searchProviders]);

  return { ...state, refetch: searchProviders };
}

/**
 * Hook to search providers near current location
 */
export function useSearchProvidersNearMe(
  request: Omit<SearchProvidersRequest, "userLocation">
) {
  const [state, setState] = useState<UsePaginatedProvidersState>({
    providers: [],
    total: 0,
    count: 0,
    loading: true,
    error: null,
  });

  const requestRef = useRef(request);
  requestRef.current = request;

  const searchProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await providerAPI.searchProvidersNearMe(requestRef.current);
      setState({
        providers: data.providers,
        total: data.total,
        count: data.count,
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
    searchProviders();
  }, [JSON.stringify(request), searchProviders]);

  return { ...state, refetch: searchProviders };
}

/**
 * Hook to calculate distance to a provider
 */
export function useDistanceToProvider(
  providerId: string,
  userLocation?: Coordinates
) {
  const [state, setState] = useState<UseProviderState<DistanceResult>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchDistance = useCallback(async () => {
    if (!providerId || !userLocation) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await providerAPI.getDistanceToProvider(
        providerId,
        userLocation
      );
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [providerId, userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    fetchDistance();
  }, [fetchDistance]);

  return { ...state, refetch: fetchDistance };
}

/**
 * Hook to get available private services for a provider
 */
export function useAvailablePrivateServices(providerId: string) {
  const [state, setState] = useState<UseProviderState<Service[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchServices = useCallback(async () => {
    if (!providerId) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await providerAPI.getAvailablePrivateServices(providerId);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [providerId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { ...state, refetch: fetchServices };
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
 * Hook to create a provider profile
 */
export function useCreateProviderProfile() {
  const [state, setState] = useState<MutationState<ProviderProfile>>({
    data: null,
    loading: false,
    error: null,
  });

  const createProfile = async (data: CreateProviderProfileRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await providerAPI.createProviderProfile(data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, createProfile };
}

/**
 * Hook to update a provider profile
 */
export function useUpdateProviderProfile() {
  const [state, setState] = useState<MutationState<ProviderProfile>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateProfile = async (
    providerId: string,
    data: UpdateProviderProfileRequest
  ) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await providerAPI.updateProviderProfile(providerId, data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, updateProfile };
}

/**
 * Hook to delete a provider profile
 */
export function useDeleteProviderProfile() {
  const [state, setState] = useState<MutationState<{ message: string }>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteProfile = async (providerId: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await providerAPI.deleteProviderProfile(providerId);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, deleteProfile };
}

/**
 * Hook to restore a provider profile
 */
export function useRestoreProviderProfile() {
  const [state, setState] = useState<MutationState<{ message: string }>>({
    data: null,
    loading: false,
    error: null,
  });

  const restoreProfile = async (providerId: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await providerAPI.restoreProviderProfile(providerId);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, restoreProfile };
}

/**
 * Hook to add a service to provider
 */
export function useAddServiceToProvider() {
  const [state, setState] = useState<MutationState<ProviderProfile>>({
    data: null,
    loading: false,
    error: null,
  });

  const addService = async (providerId: string, request: AddServiceRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await providerAPI.addServiceToProvider(providerId, request);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, addService };
}

/**
 * Hook to remove a service from provider
 */
export function useRemoveServiceFromProvider() {
  const [state, setState] = useState<MutationState<ProviderProfile>>({
    data: null,
    loading: false,
    error: null,
  });

  const removeService = async (providerId: string, serviceId: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await providerAPI.removeServiceFromProvider(
        providerId,
        serviceId
      );
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
      throw err;
    }
  };

  return { ...state, removeService };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get current user location
 */
export function useCurrentLocation() {
  const [state, setState] = useState<UseProviderState<Coordinates>>({
    data: null,
    loading: true,
    error: null,
  });

  const getLocation = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const location = await providerAPI.getCurrentLocation();
      setState({ data: location, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { ...state, refetch: getLocation };
}

/**
 * Hook to get current location with address
 */
export function useCurrentLocationWithAddress() {
  const [state, setState] = useState<UseProviderState<any>>({
    data: null,
    loading: true,
    error: null,
  });

  const getLocation = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const location = await providerAPI.getCurrentLocationWithAddress();
      setState({ data: location, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { ...state, refetch: getLocation };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook that provides provider utility functions
 */
export function useProviderUtils() {
  return {
    isProviderActive: providerAPI.isProviderActive.bind(providerAPI),
    isProviderAvailableNow: providerAPI.isProviderAvailableNow.bind(providerAPI),
    getWorkingHoursForDay: providerAPI.getWorkingHoursForDay.bind(providerAPI),
    sortByDistance: providerAPI.sortByDistance.bind(providerAPI),
    filterActive: providerAPI.filterActive.bind(providerAPI),
    formatDistance: providerAPI.formatDistance.bind(providerAPI),
    isValidGhanaPostGPS: providerAPI.isValidGhanaPostGPS.bind(providerAPI),
    isValidCoordinates: providerAPI.isValidCoordinates.bind(providerAPI),
    isWithinGhanaBounds: providerAPI.isWithinGhanaBounds.bind(providerAPI),
    formatLocation: providerAPI.formatLocation.bind(providerAPI),
    getLocationDisplayWithLandmark:
      providerAPI.getLocationDisplayWithLandmark.bind(providerAPI),
  };
}