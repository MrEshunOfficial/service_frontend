// hooks/useProfile.ts

import { APIError } from "@/lib/api/base/api-client";
import { profileAPI } from "@/lib/api/profiles/user.profile.api";
import { UpdateProfileRequest, CompleteProfile, CreateProfileRequest, ProfileStats, ProfileSearchResult, ProfileSearchParams, BatchProfilesResult, BatchProfilesRequest, PaginationParams, PaginatedProfilesResult, BulkUpdateResult, BulkUpdateRequest } from "@/types/profiles/profile.types";
import { UserProfile } from "@/types/profiles/provider-profile.types";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook state interface
 */
interface UseProfileState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook options
 */
interface UseProfileOptions {
  autoLoad?: boolean;
  loadOnMount?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: APIError) => void;
}

/**
 * Main profile hook for current user
 * Auto-loads profile on mount by default
 */
export function useProfile(options: UseProfileOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<UserProfile>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Keep refs up to date
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadProfile = useCallback(async (includeDetails = false) => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await profileAPI.getMyProfile(includeDetails);
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccessRef.current?.(data);
      }
      return data;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await profileAPI.updateMyProfile(updates);
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccessRef.current?.(data);
      }
      return data;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  const deleteProfile = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await profileAPI.deleteMyProfile();
      if (isMountedRef.current) {
        setState({ data: null, loading: false, error: null });
        onSuccessRef.current?.(null);
      }
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  const restoreProfile = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await profileAPI.restoreMyProfile();
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccessRef.current?.(data);
      }
      return data;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadProfile();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadProfile]);

  return {
    profile: state.data,
    loading: state.loading,
    error: state.error,
    loadProfile,
    updateProfile,
    deleteProfile,
    restoreProfile,
    refetch: loadProfile,
  };
}

/**
 * Hook for complete profile with picture details
 */
export function useCompleteProfile(options: UseProfileOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<CompleteProfile>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadCompleteProfile = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await profileAPI.getCompleteProfile();
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccessRef.current?.(data);
      }
      return data;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadCompleteProfile();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadCompleteProfile]);

  return {
    completeProfile: state.data,
    loading: state.loading,
    error: state.error,
    loadCompleteProfile,
    refetch: loadCompleteProfile,
  };
}

/**
 * Hook for profile creation
 */
export function useCreateProfile(options: UseProfileOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<UserProfile>>({
    data: null,
    loading: false,
    error: null,
  });

  const createProfile = useCallback(
    async (data: CreateProfileRequest) => {
      setState({ data: null, loading: true, error: null });
      try {
        const profile = await profileAPI.createProfile(data);
        setState({ data: profile, loading: false, error: null });
        onSuccess?.(profile);
        return profile;
      } catch (err) {
        const error = err as APIError;
        setState({ data: null, loading: false, error });
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    profile: state.data,
    loading: state.loading,
    error: state.error,
    createProfile,
  };
}

/**
 * Hook for checking if profile exists
 */
export function useProfileExists(options: UseProfileOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<boolean>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const checkExists = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const exists = await profileAPI.checkProfileExists();
      if (isMountedRef.current) {
        setState({ data: exists, loading: false, error: null });
        onSuccessRef.current?.(exists);
      }
      return exists;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      checkExists();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, checkExists]);

  return {
    exists: state.data,
    loading: state.loading,
    error: state.error,
    checkExists,
    refetch: checkExists,
  };
}

/**
 * Hook for profile statistics
 */
export function useProfileStats(options: UseProfileOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<ProfileStats>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await profileAPI.getMyProfileStats();
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccessRef.current?.(data);
      }
      return data;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadStats();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadStats]);

  return {
    stats: state.data,
    loading: state.loading,
    error: state.error,
    loadStats,
    refetch: loadStats,
  };
}

/**
 * Hook for profile search
 */
export function useProfileSearch() {
  const [state, setState] = useState<UseProfileState<ProfileSearchResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchProfiles = useCallback(async (params: ProfileSearchParams) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await profileAPI.searchProfiles(params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err as APIError;
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return {
    searchResults: state.data,
    loading: state.loading,
    error: state.error,
    searchProfiles,
  };
}

/**
 * Hook for batch profile fetching
 */
export function useBatchProfiles() {
  const [state, setState] = useState<UseProfileState<BatchProfilesResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const getProfiles = useCallback(async (request: BatchProfilesRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await profileAPI.getProfilesByUserIds(request);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err as APIError;
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return {
    profiles: state.data,
    loading: state.loading,
    error: state.error,
    getProfiles,
  };
}

/**
 * Hook for admin: get all profiles with pagination
 */
export function useAllProfiles(
  params: PaginationParams = {},
  options: UseProfileOptions = {}
) {
  const { autoLoad = false, onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<PaginatedProfilesResult>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const paramsRef = useRef(params);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    paramsRef.current = params;
  }, [onSuccess, onError, params]);

  const loadProfiles = useCallback(async (customParams?: PaginationParams) => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await profileAPI.getAllProfiles(
        customParams || paramsRef.current
      );
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccessRef.current?.(data);
      }
      return data;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadProfiles();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadProfiles]);

  return {
    profiles: state.data,
    loading: state.loading,
    error: state.error,
    loadProfiles,
    refetch: loadProfiles,
  };
}

/**
 * Hook for admin: bulk update profiles
 */
export function useBulkUpdateProfiles(options: UseProfileOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<BulkUpdateResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const bulkUpdate = useCallback(
    async (request: BulkUpdateRequest) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await profileAPI.bulkUpdateProfiles(request);
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err as APIError;
        setState({ data: null, loading: false, error });
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    result: state.data,
    loading: state.loading,
    error: state.error,
    bulkUpdate,
  };
}

/**
 * Hook for fetching specific user profile by ID (admin)
 */
export function useUserProfile(
  userId?: string,
  options: UseProfileOptions = {}
) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseProfileState<UserProfile>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const userIdRef = useRef(userId);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    userIdRef.current = userId;
  }, [onSuccess, onError, userId]);

  const loadProfile = useCallback(
    async (id?: string, includeDetails = false) => {
      const targetId = id || userIdRef.current;
      if (!targetId) {
        throw new Error("User ID is required");
      }

      if (!isMountedRef.current) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await profileAPI.getProfileByUserId(
          targetId,
          includeDetails
        );
        if (isMountedRef.current) {
          setState({ data, loading: false, error: null });
          onSuccessRef.current?.(data);
        }
        return data;
      } catch (err) {
        const error = err as APIError;
        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, error, loading: false }));
          onErrorRef.current?.(error);
        }
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad && userId) {
      loadProfile();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, userId, loadProfile]);

  return {
    profile: state.data,
    loading: state.loading,
    error: state.error,
    loadProfile,
    refetch: loadProfile,
  };
}