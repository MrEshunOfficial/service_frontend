// ============================================
// hooks/useOAuth.ts - Updated to use new API structure
// ============================================

import type { AuthResponse } from "@/types/user.types";

import { APIError } from "@/lib/api/base/api-client";
import { useState } from "react";
import {
  GoogleAuthData,
  AppleAuthData,
  LinkProviderData,
  oAuthAPI,
} from "@/lib/api/auth/oauth.api";

interface UseOAuthReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Google Auth
  googleAuth: (data: GoogleAuthData) => Promise<AuthResponse | null>;

  // Apple Auth
  appleAuth: (data: AppleAuthData) => Promise<AuthResponse | null>;

  // Link Provider
  linkProvider: (data: LinkProviderData) => Promise<AuthResponse | null>;

  // Utilities
  clearError: () => void;
  resetState: () => void;
}

export const useOAuth = (): UseOAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Reset all state
  const resetState = () => {
    setIsLoading(false);
    setError(null);
  };

  // Google Authentication
  const googleAuth = async (
    data: GoogleAuthData
  ): Promise<AuthResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await oAuthAPI.googleAuth(data);

      return response;
    } catch (err) {
      const apiError = err as APIError;
      const errorMessage = apiError.message || "Google authentication failed";
      setError(errorMessage);
      console.error("Google auth error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Apple Authentication
  const appleAuth = async (
    data: AppleAuthData
  ): Promise<AuthResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await oAuthAPI.appleAuth(data);

      return response;
    } catch (err) {
      const apiError = err as APIError;
      const errorMessage = apiError.message || "Apple authentication failed";
      setError(errorMessage);
      console.error("Apple auth error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Link Provider to Existing Account
  const linkProvider = async (
    data: LinkProviderData
  ): Promise<AuthResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await oAuthAPI.linkProvider(data);

      return response;
    } catch (err) {
      const apiError = err as APIError;
      const errorMessage =
        apiError.message || "Failed to link provider account";
      setError(errorMessage);
      console.error("Link provider error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    error,

    // Methods
    googleAuth,
    appleAuth,
    linkProvider,

    // Utilities
    clearError,
    resetState,
  };
};
