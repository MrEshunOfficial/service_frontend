// hooks/useAdminUsers.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { authAPI } from "@/lib/api/auth/auth.api";
import { APIError } from "@/lib/api/base/api-client";
import {
  User,
  PaginatedUsersResponse,
  UpdateUserRoleData,
  GetUsersParams,
} from "@/types/user.types";

/**
 * Hook state interface
 */
interface UseAdminUsersState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook options
 */
interface UseAdminUsersOptions {
  autoLoad?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: APIError) => void;
}

/**
 * Type guard for API errors
 */
function isAPIError(error: unknown): error is APIError {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
}

/**
 * Convert unknown error to APIError
 */
function toAPIError(error: unknown): APIError {
  if (isAPIError(error)) {
    return error as APIError;
  }
  return new Error('An unknown error occurred') as APIError;
}

/**
 * Normalize API user data to match User type interface
 * Handles field name discrepancies between API and frontend
 */
function normalizeUserData(apiUser: any): User {
  return {
    _id: apiUser._id || apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    isEmailVerified: apiUser.isEmailVerified ?? apiUser.isVerified ?? false,
    systemRole: apiUser.systemRole,
    authProvider: apiUser.authProvider || apiUser.provider || 'credentials',
    systemAdminName: apiUser.systemAdminName || null,
    isAdmin: apiUser.isAdmin ?? false,
    isSuperAdmin: apiUser.isSuperAdmin ?? false,
    security: {
      passwordChangedAt: apiUser.security?.passwordChangedAt,
      lastLogin: apiUser.security?.lastLogin || apiUser.lastLogin,
      lastLoggedOut: apiUser.security?.lastLoggedOut,
    },
    isDeleted: apiUser.isDeleted ?? false,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    avatar: apiUser.avatar,
  };
}

/**
 * Hook for fetching paginated users list (Admin)
 */
export function useAdminUsers(
  params: GetUsersParams = {},
  options: UseAdminUsersOptions = {}
) {
  const { autoLoad = false, onSuccess, onError } = options;
  const [state, setState] = useState<UseAdminUsersState<PaginatedUsersResponse>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const loadUsers = useCallback(async (customParams?: GetUsersParams) => {
    if (!isMountedRef.current) return;

    // Cancel previous request if it exists
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await authAPI.getAllUsers(customParams || params);
      
      // Normalize all users in the response
      const normalizedData = {
        ...data,
        users: data.users.map(normalizeUserData),
      };
      
      if (isMountedRef.current) {
        setState({ data: normalizedData, loading: false, error: null });
        onSuccess?.(normalizedData);
      }
      return normalizedData;
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = toAPIError(err);
      
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
      }
      throw error;
    }
  }, [params, onSuccess, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoLoad) {
      loadUsers();
    }
    
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [autoLoad, loadUsers]);

  return {
    users: state.data?.users || null,
    pagination: state.data?.pagination || null,
    loading: state.loading,
    error: state.error,
    loadUsers,
    refetch: loadUsers,
  };
}

/**
 * Hook for fetching a single user by ID (Admin)
 */
export function useAdminUser(
  userId?: string,
  options: UseAdminUsersOptions = {}
) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseAdminUsersState<User>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const loadUser = useCallback(async (id?: string) => {
    const targetId = id || userId;
    
    if (!targetId || targetId === 'undefined') {
      const error = new Error('Valid user ID is required') as APIError;
      setState((prev) => ({ ...prev, error, loading: false }));
      onError?.(error);
      return;
    }

    if (!isMountedRef.current) return;

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authAPI.getUserById(targetId);
      const data = response.user;
      
      // Normalize the user data to match expected User type
      const normalizedUser = data ? normalizeUserData(data) : null;
      
      if (isMountedRef.current && normalizedUser) {
        setState({ data: normalizedUser, loading: false, error: null });
        onSuccess?.(normalizedUser);
      }
      return normalizedUser;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = toAPIError(err);
      
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
      }
      throw error;
    }
  }, [userId, onSuccess, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoLoad && userId && userId !== 'undefined') {
      loadUser();
    }
    
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [autoLoad, userId, loadUser]);

  return {
    user: state.data,
    loading: state.loading,
    error: state.error,
    loadUser,
    refetch: loadUser,
  };
}

/**
 * Hook for updating user role (Super Admin)
 */
export function useUpdateUserRole(options: UseAdminUsersOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseAdminUsersState<User>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateRole = useCallback(
    async (userId: string | undefined, roleData: UpdateUserRoleData) => {
      if (!userId || userId === 'undefined') {
        const error = new Error('Valid user ID is required for updating role') as APIError;
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        throw error;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await authAPI.updateUserRole(userId, roleData);
        const data = response.user;
        
        // Normalize the response data
        const normalizedUser = data ? normalizeUserData(data) : null;
        
        if (normalizedUser) {
          setState({ data: normalizedUser, loading: false, error: null });
          onSuccess?.(normalizedUser);
        }
        return normalizedUser;
      } catch (err) {
        const error = toAPIError(err);
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    updatedUser: state.data,
    loading: state.loading,
    error: state.error,
    updateRole,
  };
}

/**
 * Hook for deleting a user (Super Admin)
 */
export function useDeleteUser(options: UseAdminUsersOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseAdminUsersState<null>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!userId || userId === 'undefined') {
        const error = new Error('Valid user ID is required for deletion') as APIError;
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        throw error;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      try {
        await authAPI.deleteUser(userId);
        setState({ data: null, loading: false, error: null });
        onSuccess?.(null);
      } catch (err) {
        const error = toAPIError(err);
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    loading: state.loading,
    error: state.error,
    deleteUser,
  };
}

/**
 * Hook for restoring a deleted user (Super Admin)
 */
export function useRestoreUser(options: UseAdminUsersOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseAdminUsersState<User>>({
    data: null,
    loading: false,
    error: null,
  });

  const restoreUser = useCallback(
    async (userId: string) => {
      if (!userId || userId === 'undefined') {
        const error = new Error('Valid user ID is required for restoration') as APIError;
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        throw error;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await authAPI.restoreUser(userId);
        const data = response.user;
        
        // Normalize the response data
        const normalizedUser = data ? normalizeUserData(data) : null;
        
        if (normalizedUser) {
          setState({ data: normalizedUser, loading: false, error: null });
          onSuccess?.(normalizedUser);
        }
        return normalizedUser;
      } catch (err) {
        const error = toAPIError(err);
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    restoredUser: state.data,
    loading: state.loading,
    error: state.error,
    restoreUser,
  };
}

/**
 * Comprehensive admin user management hook
 * Combines all user management operations in one hook
 */
export function useAdminUserManagement(
  userId?: string,
  options: UseAdminUsersOptions = {}
) {
  const { onSuccess, onError } = options;

  // Fetch single user
  const { 
    user, 
    loading: userLoading, 
    error: userError, 
    loadUser, 
    refetch 
  } = useAdminUser(userId, {
    autoLoad: !!userId && userId !== 'undefined',
    onSuccess,
    onError,
  });

  // Update user role
  const { 
    updateRole, 
    loading: updateLoading, 
    error: updateError 
  } = useUpdateUserRole({
    onSuccess: (data) => {
      refetch(); // Refresh user data after update
      onSuccess?.(data);
    },
    onError,
  });

  // Delete user
  const { 
    deleteUser, 
    loading: deleteLoading, 
    error: deleteError 
  } = useDeleteUser({
    onSuccess,
    onError,
  });

  // Restore user
  const { 
    restoreUser, 
    loading: restoreLoading, 
    error: restoreError 
  } = useRestoreUser({
    onSuccess: (data) => {
      refetch(); // Refresh user data after restore
      onSuccess?.(data);
    },
    onError,
  });

  const isLoading = userLoading || updateLoading || deleteLoading || restoreLoading;
  const error = userError || updateError || deleteError || restoreError;

  return {
    user,
    loading: isLoading,
    error,
    loadUser,
    updateRole,
    deleteUser,
    restoreUser,
    refetch,
  };
}