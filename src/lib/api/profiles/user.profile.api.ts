// api/profiles/profile-api.client.ts

import {
  ProfileExistsResponse,
  CompleteProfile,
  ProfileStats,
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfileSearchParams,
  ProfileSearchResult,
  BatchProfilesRequest,
  BatchProfilesResult,
  PaginationParams,
  PaginatedProfilesResult,
  BulkUpdateRequest,
  BulkUpdateResult,
} from "@/types/profiles/profile.types";
import { UserProfile } from "@/types/profiles/provider-profile.types";
import { APIClient } from "../base/api-client";

/**
 * Profile API Client
 * Handles all profile-related API requests
 *
 * Note: The base APIClient automatically unwraps { data: ... } responses,
 * so all methods return the data directly without needing to access .data
 */
export class ProfileAPIClient extends APIClient {
  private readonly basePath = "/api/profiles";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * Check if profile exists for current user
   * GET /api/profiles/exists
   */
  async checkProfileExists(): Promise<boolean> {
    const response = await this.get<ProfileExistsResponse>(
      `${this.basePath}/exists`,
    );
    return response.exists;
  }

  /**
   * Get current user's profile
   * GET /api/profiles/me
   */
  async getMyProfile(includeDetails = false): Promise<UserProfile> {
    return this.get<UserProfile>(`${this.basePath}/me`, { includeDetails });
  }

  /**
   * Get complete profile with picture details
   * GET /api/profiles/me/complete
   */
  async getCompleteProfile(): Promise<CompleteProfile> {
    return this.get<CompleteProfile>(`${this.basePath}/me/complete`);
  }

  /**
   * Get current user's profile statistics
   * GET /api/profiles/me/stats
   */
  async getMyProfileStats(): Promise<ProfileStats> {
    return this.get<ProfileStats>(`${this.basePath}/me/stats`);
  }

  /**
   * Create a new profile for current user
   * POST /api/profiles
   */
  async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
    return this.post<UserProfile>(this.basePath, data);
  }

  /**
   * Update current user's profile
   * PATCH /api/profiles/me
   */
  async updateMyProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    return this.patch<UserProfile>(`${this.basePath}/me`, updates);
  }

  /**
   * Soft delete current user's profile
   * DELETE /api/profiles/me
   */
  async deleteMyProfile(): Promise<void> {
    await this.delete<void>(`${this.basePath}/me`);
  }

  /**
   * Restore current user's soft deleted profile
   * POST /api/profiles/me/restore
   */
  async restoreMyProfile(): Promise<UserProfile> {
    return this.post<UserProfile>(`${this.basePath}/me/restore`);
  }

  /**
   * Search profiles by bio
   * GET /api/profiles/search
   */
  async searchProfiles(
    params: ProfileSearchParams,
  ): Promise<ProfileSearchResult> {
    return this.get<ProfileSearchResult>(`${this.basePath}/search`, params);
  }

  /**
   * Get multiple profiles by user IDs (batch operation)
   * POST /api/profiles/batch
   */
  async getProfilesByUserIds(
    request: BatchProfilesRequest,
  ): Promise<BatchProfilesResult> {
    return this.post<BatchProfilesResult>(`${this.basePath}/batch`, request);
  }

  /**
   * Get all profiles with pagination (admin only)
   * GET /api/profiles
   */
  async getAllProfiles(
    params: PaginationParams = {},
  ): Promise<PaginatedProfilesResult> {
    return this.get<PaginatedProfilesResult>(this.basePath, params);
  }

  /**
   * Bulk update profiles (admin only)
   * PATCH /api/profiles/bulk
   */
  async bulkUpdateProfiles(
    request: BulkUpdateRequest,
  ): Promise<BulkUpdateResult> {
    return this.patch<BulkUpdateResult>(`${this.basePath}/bulk`, request);
  }

  /**
   * Get profile by user ID (admin only)
   * GET /api/profiles/user/:userId
   */
  async getProfileByUserId(
    userId: string,
    includeDetails = false,
  ): Promise<UserProfile> {
    return this.get<UserProfile>(`${this.basePath}/user/${userId}`, {
      includeDetails,
    });
  }

  /**
   * Get profile by profile ID (admin only)
   * GET /api/profiles/:profileId
   */
  async getProfileById(
    profileId: string,
    includeDetails = false,
  ): Promise<UserProfile> {
    return this.get<UserProfile>(`${this.basePath}/${profileId}`, {
      includeDetails,
    });
  }

  /**
   * Update profile by profile ID (admin only)
   * PATCH /api/profiles/:profileId
   */
  async updateProfileById(
    profileId: string,
    updates: UpdateProfileRequest,
  ): Promise<UserProfile> {
    return this.patch<UserProfile>(`${this.basePath}/${profileId}`, updates);
  }

  /**
   * Permanently delete profile (admin only)
   * DELETE /api/profiles/:userId/permanent
   */
  async permanentlyDeleteProfile(userId: string): Promise<void> {
    await this.delete<void>(`${this.basePath}/${userId}/permanent`);
  }
}

// Export singleton instance
export const profileAPI = new ProfileAPIClient();
