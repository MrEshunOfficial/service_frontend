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
  LocationVerificationRequest,
  NearbySearchRequest,
  NearestProvidersParams,
  ProviderSearchParams,
  ReverseGeocodeRequest,
  GetAllProvidersParams,
  NearbyServiceProvidersParams,
  SearchProvidersResponse,
} from "@/types/profiles/provider-profile.types";
import {
  Coordinates,
  IdDetails,
  PopulationLevel,
  UserLocation,
} from "@/types/base.types";
import { useState, useEffect, useCallback } from "react";
import { ProviderProfileAPI } from "@/lib/api/profiles/provider.profile.api";
import { toast } from "sonner";

const providerAPI = new ProviderProfileAPI();

// ── Shared state types ────────────────────────────────────────────────────────

interface UseProviderProfileState {
  profile: ProviderProfile | PopulatedProviderProfile | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

interface UseProviderProfileByIdState {
  profile: ProviderProfile | PopulatedProviderProfile | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Shared state shape for hooks that return a list of providers with pagination.
 * Declared once here to avoid the duplicate identifier TS error.
 */
interface ProviderListState {
  results: Array<ProviderProfile | PopulatedProviderProfile>;
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── useProviderProfile ────────────────────────────────────────────────────────

/**
 * Manages the current user's provider profile.
 * Auto-loads on mount by default.
 */
export function useProviderProfile(
  autoLoad = true,
  populate: PopulationLevel = PopulationLevel.STANDARD
) {
  const [state, setState] = useState<UseProviderProfileState>({
    profile: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.getMyProviderProfile(populate);
      setState({ profile, loading: false, error: null, isInitialized: true });
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [populate]);

  useEffect(() => {
    if (autoLoad && !state.isInitialized) fetchProfile();
  }, [autoLoad, state.isInitialized, fetchProfile]);

  const createProfile = useCallback(
    async (data: CreateProviderProfileRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await providerAPI.createProviderProfile(data);
        setState({ profile, loading: false, error: null, isInitialized: true });
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

  const updateProfile = useCallback(
    async (data: UpdateProviderProfileRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await providerAPI.updateMyProviderProfile(data);
        setState((prev) => ({ ...prev, profile, loading: false }));
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

  const deleteProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await providerAPI.deleteMyProviderProfile();
      setState({ profile: null, loading: false, error: null, isInitialized: true });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as APIError,
      }));
      throw error;
    }
  }, []);

  const restoreProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.restoreMyProviderProfile();
      setState({ profile, loading: false, error: null, isInitialized: true });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as APIError,
      }));
      throw error;
    }
  }, []);

  const updateIdDetails = useCallback(async (data: IdDetails) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await providerAPI.updateMyIdDetails(data);
      setState((prev) => ({ ...prev, profile, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as APIError,
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchProfile,
    createProfile,
    updateProfile,
    refreshProfile: fetchProfile,
    deleteProfile,
    restoreProfile,
    updateIdDetails,
    clearError,
  };
}

// ── useProviderProfileById ────────────────────────────────────────────────────

/**
 * Fetches a provider profile by its ID.
 * Auto-loads when `providerId` is set.
 */
export function useProviderProfileById(
  providerId: string,
  autoLoad = true,
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
      const profile = await providerAPI.getProviderProfile(providerId, populate);
      setState({ profile, loading: false, error: null, isInitialized: true });
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [providerId, populate]);

  useEffect(() => {
    if (autoLoad && providerId && !state.isInitialized) fetchProfile();
  }, [autoLoad, providerId, state.isInitialized, fetchProfile]);

  return { ...state, fetchProfile, refreshProfile: fetchProfile };
}

// ── useProviderSearch ─────────────────────────────────────────────────────────

/**
 * Searches providers with advanced filters.
 * Requires an explicit `searchProviders()` call — does NOT auto-load.
 *
 * Uses `ProviderSearchParams` (not `GetAllProvidersParams`) to match the
 * `providerAPI.searchProviders()` signature correctly.
 */
export function useProviderSearch() {
  const [state, setState] = useState<ProviderListState>({
    results: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  });

  const searchProviders = useCallback(
    async (params: ProviderSearchParams) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response: SearchProvidersResponse =
          await providerAPI.searchProviders(params);
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
    },
    []
  );

  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  }, []);

  return { ...state, searchProviders, clearResults };
}

// ── useNearestProviders ───────────────────────────────────────────────────────

interface UseNearestProvidersState {
  results: ProviderWithDistance[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Finds the nearest providers by GPS coordinates.
 * Requires an explicit `findNearest()` call — does NOT auto-load.
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
      setState({ results, loading: false, error: null });
    } catch (error) {
      setState({ results: [], loading: false, error: error as APIError });
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({ results: [], loading: false, error: null });
  }, []);

  return { ...state, findNearest, clearResults };
}

// ── useProvidersByLocation ────────────────────────────────────────────────────

interface UseProvidersByLocationState {
  providers: ProviderProfile[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Finds providers by region/city.
 */
export function useProvidersByLocation(
  region: string,
  city?: string,
  autoLoad = true,
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
      setState({ providers, loading: false, error: null });
    } catch (error) {
      setState({ providers: [], loading: false, error: error as APIError });
    }
  }, [region, city, populate]);

  useEffect(() => {
    if (autoLoad && region) fetchProviders();
  }, [autoLoad, region, city, fetchProviders]);

  return { ...state, fetchProviders, refreshProviders: fetchProviders };
}

// ── useProvidersByService ─────────────────────────────────────────────────────

interface UseProvidersByServiceState {
  providers: ProviderProfile[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Finds providers that offer a specific service.
 */
export function useProvidersByService(
  serviceId: string,
  autoLoad = true,
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
      setState({ providers, loading: false, error: null });
    } catch (error) {
      setState({ providers: [], loading: false, error: error as APIError });
    }
  }, [serviceId, populate]);

  useEffect(() => {
    if (autoLoad && serviceId) fetchProviders();
  }, [autoLoad, serviceId, fetchProviders]);

  return { ...state, fetchProviders, refreshProviders: fetchProviders };
}

// ── useNearbyServiceProviders ─────────────────────────────────────────────────

interface UseNearbyServiceProvidersState {
  results: ProviderWithMatchedServices[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Finds nearby providers offering specific services.
 * Requires an explicit `findNearbyServices()` call — does NOT auto-load.
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
        setState({ results, loading: false, error: null });
      } catch (error) {
        setState({ results: [], loading: false, error: error as APIError });
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setState({ results: [], loading: false, error: null });
  }, []);

  return { ...state, findNearbyServices, clearResults };
}

// ── useCompanyTrainedProviders ────────────────────────────────────────────────

interface UseCompanyTrainedProvidersState {
  providers: ProviderProfile[];
  loading: boolean;
  error: APIError | null;
}

/**
 * Finds company-trained providers, optionally filtered by region.
 */
export function useCompanyTrainedProviders(
  region?: string,
  autoLoad = true,
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
      setState({ providers, loading: false, error: null });
    } catch (error) {
      setState({ providers: [], loading: false, error: error as APIError });
    }
  }, [region, populate]);

  useEffect(() => {
    if (autoLoad) fetchProviders();
  }, [autoLoad, fetchProviders]);

  return { ...state, fetchProviders, refreshProviders: fetchProviders };
}

// ── useProviderDistance ───────────────────────────────────────────────────────

interface UseProviderDistanceState {
  distance: DistanceCalculationResponse | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Calculates the distance from given coordinates to a specific provider.
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
        setState({ distance, loading: false, error: null });
      } catch (error) {
        setState({ distance: null, loading: false, error: error as APIError });
      }
    },
    [providerId]
  );

  return { ...state, calculateDistance };
}

// ── useLocationEnrichment ─────────────────────────────────────────────────────

interface LocationEnrichmentParams {
  ghanaPostGPS: string;
  nearbyLandmark?: string;
  coordinates?: Coordinates;
}

interface LocationEnrichmentResponse {
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
  streetName?: string;
  houseNumber?: string;
  gpsCoordinates?: Coordinates;
  isAddressVerified?: boolean;
  sourceProvider?: "openstreetmap" | "google" | "ghanapost";
}

/**
 * Enriches location data from a Ghana Post GPS code.
 * Makes a direct fetch call so it can be used both inside and outside
 * of the providerAPI context.
 */
export function useLocationEnrichment() {
  const [loading, setLoading] = useState(false);

  const enrichLocation = async (
    params: LocationEnrichmentParams
  ): Promise<LocationEnrichmentResponse | null> => {
    setLoading(true);
    try {
      const response = await fetch("/api/providers/location/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ghanaPostGPS: params.ghanaPostGPS,
          nearbyLandmark: params.nearbyLandmark,
          coordinates: params.coordinates,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Failed to enrich location");
      }

      return {
        region: result.data.location?.region,
        city: result.data.location?.city,
        district: result.data.location?.district,
        locality: result.data.location?.locality,
        streetName: result.data.location?.streetName,
        houseNumber: result.data.location?.houseNumber,
        gpsCoordinates: result.data.coordinates,
        isAddressVerified: result.data.verified,
        sourceProvider: result.data.source,
      };
    } catch (error) {
      console.error("Location enrichment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to enrich location"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { enrichLocation, loading };
}

// ── useLocationVerification ───────────────────────────────────────────────────

interface UseLocationVerificationState {
  verification: LocationVerificationResponse | null;
  loading: boolean;
  error: APIError | null;
}

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
        setState({ verification, loading: false, error: null });
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

  return { ...state, verifyLocation };
}

// ── useGeocode ────────────────────────────────────────────────────────────────

interface UseGeocodeState {
  result: GeocodeResponse | null;
  loading: boolean;
  error: APIError | null;
}

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
      setState({ result, loading: false, error: null });
    } catch (error) {
      setState({ result: null, loading: false, error: error as APIError });
      throw error;
    }
  }, []);

  return { ...state, geocode };
}

// ── useReverseGeocode ─────────────────────────────────────────────────────────

interface UseReverseGeocodeState {
  result: UserLocation | null;
  loading: boolean;
  error: APIError | null;
}

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
      setState({ result, loading: false, error: null });
    } catch (error) {
      setState({ result: null, loading: false, error: error as APIError });
      throw error;
    }
  }, []);

  return { ...state, reverseGeocode };
}

// ── useNearbyPlaces ───────────────────────────────────────────────────────────

interface UseNearbyPlacesState {
  places: NearbyPlace[];
  loading: boolean;
  error: APIError | null;
}

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
      setState({ places, loading: false, error: null });
    } catch (error) {
      setState({ places: [], loading: false, error: error as APIError });
      throw error;
    }
  }, []);

  const clearPlaces = useCallback(() => {
    setState({ places: [], loading: false, error: null });
  }, []);

  return { ...state, searchNearby, clearPlaces };
}

// ── useDistanceCalculation ────────────────────────────────────────────────────

interface UseDistanceCalculationState {
  result: DistanceCalculationResponse | null;
  loading: boolean;
  error: APIError | null;
}

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
        setState({ result, loading: false, error: null });
      } catch (error) {
        setState({ result: null, loading: false, error: error as APIError });
        throw error;
      }
    },
    []
  );

  return { ...state, calculateDistance };
}

// ── useProviderStatistics ─────────────────────────────────────────────────────

interface UseProviderStatisticsState {
  statistics: ProviderStatistics | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

export function useProviderStatistics(autoLoad = true) {
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
      setState({ statistics, loading: false, error: null, isInitialized: true });
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
    if (autoLoad && !state.isInitialized) fetchStatistics();
  }, [autoLoad, state.isInitialized, fetchStatistics]);

  return { ...state, fetchStatistics, refreshStatistics: fetchStatistics };
}

// ── useAvailableRegions ───────────────────────────────────────────────────────

interface UseAvailableRegionsState {
  regions: string[];
  loading: boolean;
  error: APIError | null;
}

export function useAvailableRegions(autoLoad = true) {
  const [state, setState] = useState<UseAvailableRegionsState>({
    regions: [],
    loading: autoLoad,
    error: null,
  });

  const fetchRegions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const regions = await providerAPI.getAvailableRegions();
      setState({ regions, loading: false, error: null });
    } catch (error) {
      setState({ regions: [], loading: false, error: error as APIError });
    }
  }, []);

  useEffect(() => {
    if (autoLoad) fetchRegions();
  }, [autoLoad, fetchRegions]);

  return { ...state, fetchRegions };
}

// ── useAvailableCities ────────────────────────────────────────────────────────

interface UseAvailableCitiesState {
  cities: string[];
  loading: boolean;
  error: APIError | null;
}

export function useAvailableCities(region?: string, autoLoad = true) {
  const [state, setState] = useState<UseAvailableCitiesState>({
    cities: [],
    loading: autoLoad,
    error: null,
  });

  const fetchCities = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cities = await providerAPI.getAvailableCities(region);
      setState({ cities, loading: false, error: null });
    } catch (error) {
      setState({ cities: [], loading: false, error: error as APIError });
    }
  }, [region]);

  useEffect(() => {
    if (autoLoad) fetchCities();
  }, [autoLoad, region, fetchCities]);

  return { ...state, fetchCities };
}

// ── useServiceCoverage ────────────────────────────────────────────────────────

interface UseServiceCoverageState {
  coverage: ServiceCoverage | null;
  loading: boolean;
  error: APIError | null;
}

export function useServiceCoverage(serviceId: string, autoLoad = true) {
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
      setState({ coverage, loading: false, error: null });
    } catch (error) {
      setState({ coverage: null, loading: false, error: error as APIError });
    }
  }, [serviceId]);

  useEffect(() => {
    if (autoLoad && serviceId) fetchCoverage();
  }, [autoLoad, serviceId, fetchCoverage]);

  return { ...state, fetchCoverage, refreshCoverage: fetchCoverage };
}

// ── useProviderAdmin ──────────────────────────────────────────────────────────

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
 * Admin hook for provider management.
 * `getAllProviders` uses `GetAllProvidersParams` (pagination + filtering),
 * distinct from `ProviderSearchParams` (used in `useProviderSearch`).
 */
export function useProviderAdmin() {
  const [state, setState] = useState<UseProviderAdminState>({
    providers: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  });

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

  const approveProvider = useCallback(
    async (providerId: string) => {
      try {
        await providerAPI.approveProvider(providerId);
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  const rejectProvider = useCallback(
    async (providerId: string, reason: string) => {
      try {
        await providerAPI.rejectProvider(providerId, reason);
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  const suspendProvider = useCallback(
    async (providerId: string, reason: string) => {
      try {
        await providerAPI.suspendProvider(providerId, reason);
        await getAllProviders(state.pagination);
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [getAllProviders, state.pagination]
  );

  const unsuspendProvider = useCallback(async (providerId: string) => {
    try {
      await providerAPI.unsuspendProvider(providerId);
      await getAllProviders(state.pagination);
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, [getAllProviders, state.pagination]);

  const bulkOperations = useCallback(
    async (data: BulkOperationsRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await providerAPI.bulkOperations(data);
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

// ── useProviderAuditLog ───────────────────────────────────────────────────────

interface AuditLogEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

interface UseProviderAuditLogState {
  logs: AuditLogEntry[];
  loading: boolean;
  error: APIError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useProviderAuditLog(
  providerId: string,
  autoLoad = true
) {
  const [state, setState] = useState<UseProviderAuditLogState>({
    logs: [],
    loading: autoLoad,
    error: null,
    pagination: { page: 1, limit: 10, total: 0 },
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
    if (autoLoad && providerId) fetchLogs();
  }, [autoLoad, providerId, fetchLogs]);

  return { ...state, fetchLogs, refreshLogs: fetchLogs };
}