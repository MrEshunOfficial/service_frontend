// hooks/useClientProfile.ts

import { APIError } from "@/lib/api/base/api-client";
import { ClientProfileAPI } from "@/lib/api/profiles/client.profile.api";
import {
  ClientProfile,
  CreateClientProfileRequest,
  UpdateClientProfileRequest,
  UpdateIdDetailsRequest,
  UpdateCommunicationPreferencesRequest,
  CompleteClientProfile,
  ClientStats,
  VerificationStatus,
} from "@/types/profiles/client.profile.types";

import { useState, useEffect, useCallback } from "react";

// Initialize the API client
const clientAPI = new ClientProfileAPI();

// ============================================================================
// HOOK STATE TYPES
// ============================================================================

interface UseClientProfileState {
  profile: ClientProfile | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

interface UseClientProfileReturn extends UseClientProfileState {
  // Profile Operations
  fetchProfile: () => Promise<void>;
  createProfile: (data: CreateClientProfileRequest) => Promise<void>;
  updateProfile: (data: UpdateClientProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // ID Details
  updateIdDetails: (data: UpdateIdDetailsRequest) => Promise<void>;

  // Favorites
  addFavoriteService: (serviceId: string) => Promise<void>;
  removeFavoriteService: (serviceId: string) => Promise<void>;
  addFavoriteProvider: (providerId: string) => Promise<void>;
  removeFavoriteProvider: (providerId: string) => Promise<void>;

  // Address Management
  addAddress: (address: any) => Promise<void>;
  removeAddress: (addressIndex: number) => Promise<void>;
  setDefaultAddress: (addressIndex: number) => Promise<void>;

  // Communication Preferences
  updateCommunicationPreferences: (
    prefs: UpdateCommunicationPreferencesRequest
  ) => Promise<void>;

  // Utility
  clearError: () => void;
}

// ============================================================================
// MAIN HOOK: useClientProfile
// ============================================================================

/**
 * Hook for managing the current user's client profile
 * Auto-loads profile on mount
 */
export function useClientProfile(
  autoLoad: boolean = true
): UseClientProfileReturn {
  const [state, setState] = useState<UseClientProfileState>({
    profile: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await clientAPI.getMyProfile();
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
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchProfile();
    }
  }, [autoLoad, state.isInitialized, fetchProfile]);

  // Create profile
  const createProfile = useCallback(
    async (data: CreateClientProfileRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await clientAPI.createMyProfile(data);
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
    async (data: UpdateClientProfileRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await clientAPI.updateMyProfile(data);
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

  // Update ID details
  const updateIdDetails = useCallback(async (data: UpdateIdDetailsRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await clientAPI.updateMyIdDetails(data);
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

  // Add favorite service
  const addFavoriteService = useCallback(async (serviceId: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyFavorites({
        action: "add",
        serviceId,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Remove favorite service
  const removeFavoriteService = useCallback(async (serviceId: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyFavorites({
        action: "remove",
        serviceId,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Add favorite provider
  const addFavoriteProvider = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyFavorites({
        action: "add",
        providerId,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Remove favorite provider
  const removeFavoriteProvider = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyFavorites({
        action: "remove",
        providerId,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Add address
  const addAddress = useCallback(async (address: any) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyAddress({
        action: "add",
        address: address,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Remove address
  const removeAddress = useCallback(async (addressIndex: number) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyAddress({
        action: "remove",
        addressIndex,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Set default address
  const setDefaultAddress = useCallback(async (addressIndex: number) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const profile = await clientAPI.manageMyAddress({
        action: "set_default",
        addressIndex,
      });
      setState((prev) => ({ ...prev, profile }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as APIError }));
      throw error;
    }
  }, []);

  // Update communication preferences
  const updateCommunicationPreferences = useCallback(
    async (prefs: UpdateCommunicationPreferencesRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await clientAPI.updateMyCommunicationPreferences(prefs);
        // Refresh profile to get updated preferences
        await fetchProfile();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchProfile]
  );

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
    updateIdDetails,
    addFavoriteService,
    removeFavoriteService,
    addFavoriteProvider,
    removeFavoriteProvider,
    addAddress,
    removeAddress,
    setDefaultAddress,
    updateCommunicationPreferences,
    clearError,
  };
}

// ============================================================================
// HOOK: useCompleteClientProfile
// ============================================================================

interface UseCompleteClientProfileState {
  profile: CompleteClientProfile | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Hook for fetching complete client profile with stats and enriched data
 * Auto-loads on mount
 */
export function useCompleteClientProfile(autoLoad: boolean = true) {
  const [state, setState] = useState<UseCompleteClientProfileState>({
    profile: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchCompleteProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await clientAPI.getMyCompleteProfile();
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
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchCompleteProfile();
    }
  }, [autoLoad, state.isInitialized, fetchCompleteProfile]);

  return {
    ...state,
    fetchCompleteProfile,
    refreshProfile: fetchCompleteProfile,
  };
}

// ============================================================================
// HOOK: useClientStats
// ============================================================================

interface UseClientStatsState {
  stats: ClientStats | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Hook for fetching client statistics
 * Auto-loads on mount
 */
export function useClientStats(clientId: string, autoLoad: boolean = true) {
  const [state, setState] = useState<UseClientStatsState>({
    stats: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchStats = useCallback(async () => {
    if (!clientId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const stats = await clientAPI.getClientStats(clientId);
      setState({
        stats,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        stats: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [clientId]);

  // Auto-load on mount or when clientId changes
  useEffect(() => {
    if (autoLoad && clientId && !state.isInitialized) {
      fetchStats();
    }
  }, [autoLoad, clientId, state.isInitialized, fetchStats]);

  return {
    ...state,
    fetchStats,
    refreshStats: fetchStats,
  };
}

// ============================================================================
// HOOK: useVerificationStatus
// ============================================================================

interface UseVerificationStatusState {
  status: VerificationStatus | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Hook for managing verification status
 * Auto-loads on mount
 */
export function useVerificationStatus(
  clientId: string,
  autoLoad: boolean = true
) {
  const [state, setState] = useState<UseVerificationStatusState>({
    status: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchStatus = useCallback(async () => {
    if (!clientId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const status = await clientAPI.getVerificationStatus(clientId);
      setState({
        status,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        status: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [clientId]);

  // Auto-load on mount or when clientId changes
  useEffect(() => {
    if (autoLoad && clientId && !state.isInitialized) {
      fetchStatus();
    }
  }, [autoLoad, clientId, state.isInitialized, fetchStatus]);

  return {
    ...state,
    fetchStatus,
    refreshStatus: fetchStatus,
  };
}

// ============================================================================
// HOOK: useClientSearch
// ============================================================================

/**
 * Hook for searching and filtering clients
 * Does NOT auto-load (requires explicit search call)
 */
export function useClientSearch() {
  const [results, setResults] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const searchClients = useCallback(
    async (params: {
      query?: string;
      region?: string;
      city?: string;
      isVerified?: boolean;
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await clientAPI.searchClients(params);
        // Response is already unpacked by base API client
        if (Array.isArray(response)) {
          setResults(response);
        } else {
          setResults((response as any).data || []);
          setPagination(
            (response as any).pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
            }
          );
        }
      } catch (error) {
        setError(error as APIError);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
  }, []);

  return {
    results,
    loading,
    error,
    pagination,
    searchClients,
    clearResults,
  };
}

// ============================================================================
// HOOK: useNearestClients
// ============================================================================

/**
 * Hook for finding nearest clients to a location
 * Does NOT auto-load (requires explicit search call)
 */
export function useNearestClients() {
  const [results, setResults] = useState<
    Array<ClientProfile & { distance: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const findNearest = useCallback(
    async (params: {
      latitude: number;
      longitude: number;
      maxDistance?: number;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const results = await clientAPI.findNearestClients(params);
        setResults(results);
      } catch (error) {
        setError(error as APIError);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    findNearest,
    clearResults,
  };
}

// ============================================================================
// HOOK: usePlatformStatistics
// ============================================================================

/**
 * Hook for fetching platform-wide client statistics
 * Auto-loads on mount
 */
export function usePlatformStatistics(autoLoad: boolean = true) {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await clientAPI.getStatistics();
      setStatistics(stats);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchStatistics();
    }
  }, [autoLoad, isInitialized, fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    isInitialized,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
  };
}
