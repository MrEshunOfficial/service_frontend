// OAuth API

import { AuthResponse } from "@/types/user.types";
import { APIClient } from "../base/api-client";

export interface GoogleAuthData {
  idToken: string;
}

export interface AppleAuthData {
  idToken: string;
  user?: {
    name?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface LinkProviderData {
  provider: "google" | "apple";
  idToken: string;
}

export class OAuthAPI extends APIClient {
  private readonly endpoint = "/api/oauth";

  // ============================================
  // GOOGLE AUTHENTICATION
  // ============================================

  async googleAuth(data: GoogleAuthData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/google`, data);
  }

  // ============================================
  // APPLE AUTHENTICATION
  // ============================================

  async appleAuth(data: AppleAuthData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/apple`, data);
  }

  // ============================================
  // LINK PROVIDER TO EXISTING ACCOUNT
  // ============================================

  async linkProvider(data: LinkProviderData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/link-provider`, data);
  }
}

// Export singleton instance
export const oAuthAPI = new OAuthAPI();
