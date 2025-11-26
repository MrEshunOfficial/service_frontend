// hooks/useAuth.ts - Updated to use new API structure

import { useState, useEffect, useCallback } from "react";

import {
  User,
  LoginData,
  SignupData,
  VerifyEmailData,
  ResendVerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  RestoreAccountData,
  AuthResponse,
} from "@/types/user.types";
import { authAPI } from "@/lib/api/auth/auth.api";
import { APIError } from "@/lib/api/base/api-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginData) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  verifyEmail: (data: VerifyEmailData) => Promise<void>;
  resendVerification: (data: ResendVerificationData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  deleteAccount: () => Promise<void>;
  restoreAccount: (data: RestoreAccountData) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleAuthAction = useCallback(
    async (
      action: () => Promise<AuthResponse>,
      onSuccess?: (response: AuthResponse) => void
    ) => {
      try {
        updateState({ isLoading: true, error: null });
        const response = await action();

        if (response.user) {
          updateState({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          updateState({ isLoading: false });
        }

        onSuccess?.(response);
      } catch (error) {
        const apiError = error as APIError;
        const errorMessage = apiError.message || "An unexpected error occurred";

        updateState({
          error: errorMessage,
          isLoading: false,
          ...(apiError.status === 401
            ? {
                user: null,
                isAuthenticated: false,
              }
            : {}),
        });
        throw error;
      }
    },
    [updateState]
  );

  // AUTHENTICATION ACTIONS
  const login = useCallback(
    async (credentials: LoginData) => {
      await handleAuthAction(() => authAPI.login(credentials));
    },
    [handleAuthAction]
  );

  const signup = useCallback(
    async (userData: SignupData) => {
      await handleAuthAction(() => authAPI.signup(userData));
    },
    [handleAuthAction]
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local state
      updateState({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  }, [updateState]);

  const refreshUser = useCallback(async () => {
    await handleAuthAction(() => authAPI.getCurrentUser());
  }, [handleAuthAction]);

  // EMAIL VERIFICATION ACTIONS
  const verifyEmail = useCallback(
    async (data: VerifyEmailData) => {
      await handleAuthAction(() => authAPI.verifyEmail(data));
    },
    [handleAuthAction]
  );

  const resendVerification = useCallback(
    async (data: ResendVerificationData) => {
      await handleAuthAction(() => authAPI.resendVerification(data));
    },
    [handleAuthAction]
  );

  // PASSWORD MANAGEMENT ACTIONS
  const forgotPassword = useCallback(
    async (data: ForgotPasswordData) => {
      await handleAuthAction(() => authAPI.forgotPassword(data));
    },
    [handleAuthAction]
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordData) => {
      await handleAuthAction(() => authAPI.resetPassword(data));
    },
    [handleAuthAction]
  );

  const changePassword = useCallback(
    async (data: ChangePasswordData) => {
      await handleAuthAction(() => authAPI.changePassword(data));
    },
    [handleAuthAction]
  );

  // TOKEN MANAGEMENT
  const refreshToken = useCallback(async () => {
    await handleAuthAction(() => authAPI.refreshToken());
  }, [handleAuthAction]);

  // ACCOUNT MANAGEMENT ACTIONS
  const deleteAccount = useCallback(async () => {
    await handleAuthAction(
      () => authAPI.deleteAccount(),
      () => {
        updateState({
          user: null,
          isAuthenticated: false,
        });
      }
    );
  }, [handleAuthAction, updateState]);

  const restoreAccount = useCallback(
    async (data: RestoreAccountData) => {
      await handleAuthAction(
        () => authAPI.restoreAccount(data),
        () => {
          // Restore account doesn't automatically log in the user
          // They need to log in again after restore
          updateState({
            user: null,
            isAuthenticated: false,
          });
        }
      );
    },
    [handleAuthAction, updateState]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Initialize authentication state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();

        if (!mounted) return;

        if (response.user) {
          updateState({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        if (!mounted) return;

        const apiError = error as APIError;

        // Log the error for debugging
        console.warn("Auth initialization failed:", error);

        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          // Only set error if it's not a simple "not authenticated" case
          error: apiError.status !== 401 ? apiError.message : null,
        });
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [updateState]);

  return {
    ...state,
    login,
    signup,
    logout,
    refreshUser,
    clearError,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount,
    restoreAccount,
    refreshToken,
  };
};
