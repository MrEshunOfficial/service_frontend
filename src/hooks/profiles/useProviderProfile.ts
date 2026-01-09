// hooks/useProviderProfile.ts

import { APIError } from "@/lib/api/base/api-client";

import {
  ProviderProfile,
  CreateProviderProfileRequest,
  UpdateProviderProfileRequest,
  PopulatedProviderProfile,
  ProviderWithDistance,
  ProviderWithMatchedServices,
  ProviderStatistics,
  ServiceCoverage,
  LocationVerificationResponse,
  GeocodeResponse,
  NearbyPlace,
  DistanceCalculationResponse,
  BulkOperationsRequest,
  DistanceCalculationRequest,
  GeocodeRequest,
  LocationEnrichmentRequest,
  LocationVerificationRequest,
  NearbySearchRequest,
  NearestProvidersParams,
  ReverseGeocodeRequest,
  GetAllProvidersParams,
  NearbyServiceProvidersParams,
} from "@/types/profiles/provider-profile.types";
import { IdDetails, PopulationLevel, UserLocation } from "@/types/base.types";
import { useState, useEffect, useCallback } from "react";
import { ProviderProfileAPI } from "@/lib/api/profiles/provider.profile.api";

// Initialize the API client
const providerAPI = new ProviderProfileAPI();

// ============================================================================
// HOOK STATE TYPES
// ============================================================================

interface UseProviderProfileState {
  profile: ProviderProfile | PopulatedProviderProfile | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

interface UseProviderProfileReturn extends UseProviderProfileState {
  // Profile Operations
  fetchProfile: () => Promise<void>;
  createProfile: (data: CreateProviderProfileRequest) => Promise<void>;
  updateProfile: (data: UpdateProviderProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteProfile: () => Promise<void>;
  restoreProfile: () => Promise<void>;

  // ID Details
  updateIdDetails: (data: IdDetails) => Promise<void>;

  // Utility
  clearError: () => void;
}

interface UseProviderSearchState {
  results: ProviderProfile[] | PopulatedProviderProfile[];
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseProviderSearchReturn {
  results: ProviderProfile[] | PopulatedProviderProfile[];
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchProviders: (params: GetAllProvidersParams) => Promise<void>;
  clearResults: () => void;
}

// ============================================================================
// MAIN HOOK: useProviderProfile
// ============================================================================

/**
 * Hook for managing the current user's provider profile
 * Auto-loads profile on mount
 */
export function useProviderProfile(
  autoLoad: boolean = true,
  populate: PopulationLevel = PopulationLevel.STANDARD
): UseProviderProfileReturn {
  const [state, setState] = useState<UseProviderProfileState>({
    profile: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.getMyProviderProfile(populate);
      setState({
        profile,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [populate]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchProfile();
    }
  }, [autoLoad, state.isInitialized, fetchProfile]);

  // Create profile
  const createProfile = useCallback(
    async (data: CreateProviderProfileRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await providerAPI.createProviderProfile(data);
        setState({
          profile,
          loading: false,
          error: null,
          isInitialized: true,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as APIError,
        }));
        throw error;
      }
    },
    []
  );

  // Update profile
  const updateProfile = useCallback(
    async (data: UpdateProviderProfileRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await providerAPI.updateMyProviderProfile(data);
        setState((prev) => ({
          ...prev,
          profile,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as APIError,
        }));
        throw error;
      }
    },
    []
  );

  // Delete profile (soft delete)
  const deleteProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await providerAPI.deleteMyProviderProfile();
      setState({
        profile: null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as APIError,
      }));
      throw error;
    }
  }, []);

  // Restore profile
  const restoreProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.restoreMyProviderProfile();
      setState({
        profile,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as APIError,
      }));
      throw error;
    }
  }, []);

  // Update ID details
  const updateIdDetails = useCallback(async (data: IdDetails) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.updateMyIdDetails(data);
      setState((prev) => ({
        ...prev,
        profile,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as APIError,
      }));
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Refresh profile (alias for fetchProfile)
  const refreshProfile = fetchProfile;

  return {
    ...state,
    fetchProfile,
    createProfile,
    updateProfile,
    refreshProfile,
    deleteProfile,
    restoreProfile,
    updateIdDetails,
    clearError,
  };
}

// ============================================================================
// HOOK: useProviderProfileById
// ============================================================================

interface UseProviderProfileByIdState {
  profile: ProviderProfile | PopulatedProviderProfile | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Hook for fetching a provider profile by ID
 * Auto-loads on mount
 */
export function useProviderProfileById(
  providerId: string,
  autoLoad: boolean = true,
  populate: PopulationLevel = PopulationLevel.STANDARD
) {
  const [state, setState] = useState<UseProviderProfileByIdState>({
    profile: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchProfile = useCallback(async () => {
    if (!providerId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.getProviderProfile(
        providerId,
        populate
      );
      setState({
        profile,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [providerId, populate]);

  // Auto-load on mount or when providerId changes
  useEffect(() => {
    if (autoLoad && providerId && !state.isInitialized) {
      fetchProfile();
    }
  }, [autoLoad, providerId, state.isInitialized, fetchProfile]);

  return {
    ...state,
    fetchProfile,
    refreshProfile: fetchProfile,
  };
}

// ============================================================================
// HOOK: useProviderSearch
// ============================================================================

interface UseProviderSearchState {
  results: ProviderProfile[] | PopulatedProviderProfile[];
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook for searching and filtering providers
 * Does NOT auto-load (requires explicit search call)
 */
export function useProviderSearch() {
  const [state, setState] = useState<UseProviderSearchState>({
    results: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });

  const searchProviders = useCallback(async (params: GetAllProvidersParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await providerAPI.searchProviders(params);
      setState({
        results: response.providers,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        results: [],
        loading: false,
        error: error as APIError,
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  }, []);

  return {
    ...state,
    searchProviders,
    clearResults,
  };
}

// ============================================================================
// HOOK: useNearestProviders
// ============================================================================

interface UseNearestProvidersState {
  results: ProviderWithDistance[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for finding nearest providers by GPS coordinates
 * Does NOT auto-load (requires explicit search call)
 */
export function useNearestProviders() {
  const [state, setState] = useState<UseNearestProvidersState>({
    results: [],
    loading: false,
    error: null,
  });

  const findNearest = useCallback(async (params: NearestProvidersParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const results = await providerAPI.findNearestProviders(params);
      setState({
        results,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        results: [],
        loading: false,
        error: error as APIError,
      });
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    findNearest,
    clearResults,
  };
}

// ============================================================================
// HOOK: useProvidersByLocation
// ============================================================================

interface UseProvidersByLocationState {
  providers: ProviderProfile[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for finding providers by region/city
 */
export function useProvidersByLocation(
  region: string,
  city?: string,
  autoLoad: boolean = true,
  populate: PopulationLevel = PopulationLevel.STANDARD
) {
  const [state, setState] = useState<UseProvidersByLocationState>({
    providers: [],
    loading: autoLoad,
    error: null,
  });

  const fetchProviders = useCallback(async () => {
    if (!region) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const providers = await providerAPI.findProvidersByLocation(
        region,
        city,
        populate
      );
      setState({
        providers,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        providers: [],
        loading: false,
        error: error as APIError,
      });
    }
  }, [region, city, populate]);

  useEffect(() => {
    if (autoLoad && region) {
      fetchProviders();
    }
  }, [autoLoad, region, city, fetchProviders]);

  return {
    ...state,
    fetchProviders,
    refreshProviders: fetchProviders,
  };
}

// ============================================================================
// HOOK: useProvidersByService
// ============================================================================

interface UseProvidersByServiceState {
  providers: ProviderProfile[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for finding providers by service ID
 */
export function useProvidersByService(
  serviceId: string,
  autoLoad: boolean = true,
  populate: PopulationLevel = PopulationLevel.STANDARD
) {
  const [state, setState] = useState<UseProvidersByServiceState>({
    providers: [],
    loading: autoLoad,
    error: null,
  });

  const fetchProviders = useCallback(async () => {
    if (!serviceId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const providers = await providerAPI.findProvidersByService(
        serviceId,
        populate
      );
      setState({
        providers,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        providers: [],
        loading: false,
        error: error as APIError,
      });
    }
  }, [serviceId, populate]);

  useEffect(() => {
    if (autoLoad && serviceId) {
      fetchProviders();
    }
  }, [autoLoad, serviceId, fetchProviders]);

  return {
    ...state,
    fetchProviders,
    refreshProviders: fetchProviders,
  };
}

// ============================================================================
// HOOK: useNearbyServiceProviders
// ============================================================================

interface UseNearbyServiceProvidersState {
  results: ProviderWithMatchedServices[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for finding nearby providers offering specific services
 * Does NOT auto-load (requires explicit search call)
 */
export function useNearbyServiceProviders() {
  const [state, setState] = useState<UseNearbyServiceProvidersState>({
    results: [],
    loading: false,
    error: null,
  });

  const findNearbyServices = useCallback(
    async (params: NearbyServiceProvidersParams) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const results = await providerAPI.findNearbyServiceProviders(params);
        setState({
          results,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          results: [],
          loading: false,
          error: error as APIError,
        });
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    findNearbyServices,
    clearResults,
  };
}

// ============================================================================
// HOOK: useCompanyTrainedProviders
// ============================================================================

interface UseCompanyTrainedProvidersState {
  providers: ProviderProfile[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for finding company-trained providers
 */
export function useCompanyTrainedProviders(
  region?: string,
  autoLoad: boolean = true,
  populate: PopulationLevel = PopulationLevel.STANDARD
) {
  const [state, setState] = useState<UseCompanyTrainedProvidersState>({
    providers: [],
    loading: autoLoad,
    error: null,
  });

  const fetchProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const providers = await providerAPI.findCompanyTrainedProviders(
        region,
        populate
      );
      setState({
        providers,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        providers: [],
        loading: false,
        error: error as APIError,
      });
    }
  }, [region, populate]);

  useEffect(() => {
    if (autoLoad) {
      fetchProviders();
    }
  }, [autoLoad, fetchProviders]);

  return {
    ...state,
    fetchProviders,
    refreshProviders: fetchProviders,
  };
}

// ============================================================================
// HOOK: useProviderDistance
// ============================================================================

interface UseProviderDistanceState {
  distance: DistanceCalculationResponse | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for calculating distance to a provider
 */
export function useProviderDistance(providerId: string) {
  const [state, setState] = useState<UseProviderDistanceState>({
    distance: null,
    loading: false,
    error: null,
  });

  const calculateDistance = useCallback(
    async (fromLatitude: number, fromLongitude: number) => {
      if (!providerId) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const distance = await providerAPI.getDistanceToProvider(
          providerId,
          fromLatitude,
          fromLongitude
        );
        setState({
          distance,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          distance: null,
          loading: false,
          error: error as APIError,
        });
      }
    },
    [providerId]
  );

  return {
    ...state,
    calculateDistance,
  };
}

// ============================================================================
// HOOK: useLocationEnrichment
// ============================================================================

interface UseLocationEnrichmentState {
  enrichedLocation: UserLocation | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for enriching location data
 */
export function useLocationEnrichment() {
  const [state, setState] = useState<UseLocationEnrichmentState>({
    enrichedLocation: null,
    loading: false,
    error: null,
  });

  const enrichLocation = useCallback(
    async (data: LocationEnrichmentRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const enrichedLocation = await providerAPI.enrichLocation(data);
        setState({
          enrichedLocation,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          enrichedLocation: null,
          loading: false,
          error: error as APIError,
        });
        throw error;
      }
    },
    []
  );

  const clearLocation = useCallback(() => {
    setState({
      enrichedLocation: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    enrichLocation,
    clearLocation,
  };
}

// ============================================================================
// HOOK: useLocationVerification
// ============================================================================

interface UseLocationVerificationState {
  verification: LocationVerificationResponse | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for verifying location coordinates
 */
export function useLocationVerification() {
  const [state, setState] = useState<UseLocationVerificationState>({
    verification: null,
    loading: false,
    error: null,
  });

  const verifyLocation = useCallback(
    async (data: LocationVerificationRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const verification = await providerAPI.verifyLocation(data);
        setState({
          verification,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          verification: null,
          loading: false,
          error: error as APIError,
        });
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    verifyLocation,
  };
}

// ============================================================================
// HOOK: useGeocode
// ============================================================================

interface UseGeocodeState {
  result: GeocodeResponse | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for geocoding addresses to coordinates
 */
export function useGeocode() {
  const [state, setState] = useState<UseGeocodeState>({
    result: null,
    loading: false,
    error: null,
  });

  const geocode = useCallback(async (data: GeocodeRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await providerAPI.geocodeAddress(data);
      setState({
        result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        result: null,
        loading: false,
        error: error as APIError,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    geocode,
  };
}

// ============================================================================
// HOOK: useReverseGeocode
// ============================================================================

interface UseReverseGeocodeState {
  result: UserLocation | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for reverse geocoding coordinates to address
 */
export function useReverseGeocode() {
  const [state, setState] = useState<UseReverseGeocodeState>({
    result: null,
    loading: false,
    error: null,
  });

  const reverseGeocode = useCallback(async (data: ReverseGeocodeRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await providerAPI.reverseGeocode(data);
      setState({
        result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        result: null,
        loading: false,
        error: error as APIError,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    reverseGeocode,
  };
}

// ============================================================================
// HOOK: useNearbyPlaces
// ============================================================================

interface UseNearbyPlacesState {
  places: NearbyPlace[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for searching nearby places
 */
export function useNearbyPlaces() {
  const [state, setState] = useState<UseNearbyPlacesState>({
    places: [],
    loading: false,
    error: null,
  });

  const searchNearby = useCallback(async (data: NearbySearchRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const places = await providerAPI.searchNearby(data);
      setState({
        places,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        places: [],
        loading: false,
        error: error as APIError,
      });
      throw error;
    }
  }, []);

  const clearPlaces = useCallback(() => {
    setState({
      places: [],
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    searchNearby,
    clearPlaces,
  };
}

// ============================================================================
// HOOK: useDistanceCalculation
// ============================================================================

interface UseDistanceCalculationState {
  result: DistanceCalculationResponse | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for calculating distance between two points
 */
export function useDistanceCalculation() {
  const [state, setState] = useState<UseDistanceCalculationState>({
    result: null,
    loading: false,
    error: null,
  });

  const calculateDistance = useCallback(
    async (data: DistanceCalculationRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await providerAPI.calculateDistance(data);
        setState({
          result,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          result: null,
          loading: false,
          error: error as APIError,
        });
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    calculateDistance,
  };
}

// ============================================================================
// HOOK: useProviderStatistics
// ============================================================================

interface UseProviderStatisticsState {
  statistics: ProviderStatistics | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Hook for fetching provider statistics
 * Auto-loads on mount
 */
export function useProviderStatistics(autoLoad: boolean = true) {
  const [state, setState] = useState<UseProviderStatisticsState>({
    statistics: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchStatistics = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const statistics = await providerAPI.getStatistics();
      setState({
        statistics,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        statistics: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchStatistics();
    }
  }, [autoLoad, state.isInitialized, fetchStatistics]);

  return {
    ...state,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
  };
}

// ============================================================================
// HOOK: useAvailableRegions
// ============================================================================

interface UseAvailableRegionsState {
  regions: string[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for fetching available regions
 * Auto-loads on mount
 */
export function useAvailableRegions(autoLoad: boolean = true) {
  const [state, setState] = useState<UseAvailableRegionsState>({
    regions: [],
    loading: autoLoad,
    error: null,
  });

  const fetchRegions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const regions = await providerAPI.getAvailableRegions();
      setState({
        regions,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        regions: [],
        loading: false,
        error: error as APIError,
      });
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      fetchRegions();
    }
  }, [autoLoad, fetchRegions]);

  return {
    ...state,
    fetchRegions,
  };
}

// ============================================================================
// HOOK: useAvailableCities
// ============================================================================

interface UseAvailableCitiesState {
  cities: string[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for fetching available cities (optionally filtered by region)
 */
export function useAvailableCities(region?: string, autoLoad: boolean = true) {
  const [state, setState] = useState<UseAvailableCitiesState>({
    cities: [],
    loading: autoLoad,
    error: null,
  });

  const fetchCities = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cities = await providerAPI.getAvailableCities(region);
      setState({
        cities,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        cities: [],
        loading: false,
        error: error as APIError,
      });
    }
  }, [region]);

  useEffect(() => {
    if (autoLoad) {
      fetchCities();
    }
  }, [autoLoad, region, fetchCities]);

  return {
    ...state,
    fetchCities,
  };
}

// ============================================================================
// HOOK: useServiceCoverage
// ============================================================================

interface UseServiceCoverageState {
  coverage: ServiceCoverage | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook for fetching service coverage data
 */
export function useServiceCoverage(
  serviceId: string,
  autoLoad: boolean = true
) {
  const [state, setState] = useState<UseServiceCoverageState>({
    coverage: null,
    loading: autoLoad,
    error: null,
  });

  const fetchCoverage = useCallback(async () => {
    if (!serviceId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const coverage = await providerAPI.getServiceCoverage(serviceId);
      setState({
        coverage,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        coverage: null,
        loading: false,
        error: error as APIError,
      });
    }
  }, [serviceId]);

  useEffect(() => {
    if (autoLoad && serviceId) {
      fetchCoverage();
    }
  }, [autoLoad, serviceId, fetchCoverage]);

  return {
    ...state,
    fetchCoverage,
    refreshCoverage: fetchCoverage,
  };
}

// ============================================================================
// HOOK: useProviderAdmin (Admin Operations)
// ============================================================================

interface UseProviderAdminState {
  providers: Array<ProviderProfile | PopulatedProviderProfile>;
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook for admin provider management operations
 */
export function useProviderAdmin() {
  const [state, setState] = useState<UseProviderAdminState>({
    providers: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });

  // Get all providers
  const getAllProviders = useCallback(
    async (params?: GetAllProvidersParams) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await providerAPI.getAllProviders(params);
        setState({
          providers: response.providers,
          pagination: {
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
          },
          loading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as APIError,
        }));
      }
    },
    []
  );

  // Approve provider
  const approveProvider = useCallback(
    async (providerId: string) => {
      try {
        await providerAPI.approveProvider(providerId);
        // Refresh the list
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  // Reject provider
  const rejectProvider = useCallback(
    async (providerId: string, reason: string) => {
      try {
        await providerAPI.rejectProvider(providerId, reason);
        // Refresh the list
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  // Suspend provider
  const suspendProvider = useCallback(
    async (providerId: string, reason: string) => {
      try {
        await providerAPI.suspendProvider(providerId, reason);
        // Refresh the list
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  // Unsuspend provider
  const unsuspendProvider = useCallback(
    async (providerId: string) => {
      try {
        await providerAPI.unsuspendProvider(providerId);
        // Refresh the list
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  // Bulk operations
  const bulkOperations = useCallback(
    async (data: BulkOperationsRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await providerAPI.bulkOperations(data);
        // Refresh the list
        await getAllProviders(state.pagination);
        return response;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as APIError,
        }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  return {
    ...state,
    getAllProviders,
    approveProvider,
    rejectProvider,
    suspendProvider,
    unsuspendProvider,
    bulkOperations,
  };
}

// ============================================================================
// HOOK: useProviderAuditLog
// ============================================================================

interface UseProviderAuditLogState {
  logs: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    details?: Record<string, any>;
  }>;
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Hook for fetching provider audit logs
 */
export function useProviderAuditLog(
  providerId: string,
  autoLoad: boolean = true
) {
  const [state, setState] = useState<UseProviderAuditLogState>({
    logs: [],
    loading: autoLoad,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
  });

  const fetchLogs = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      if (!providerId) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await providerAPI.getProviderAuditLog(
          providerId,
          params
        );
        setState({
          logs: response.logs,
          pagination: {
            page: response.page,
            limit: response.limit,
            total: response.total,
          },
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          logs: [],
          pagination: { page: 1, limit: 10, total: 0 },
          loading: false,
          error: error as APIError,
        });
      }
    },
    [providerId]
  );

  useEffect(() => {
    if (autoLoad && providerId) {
      fetchLogs();
    }
  }, [autoLoad, providerId, fetchLogs]);

  return {
    ...state,
    fetchLogs,
    refreshLogs: fetchLogs,
  };
}
