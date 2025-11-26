// api/profiles/profile-api.client.ts

import {
  APIResponse,
  ProfileExistsResponse,
  UserProfile,
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
} from "@/types/profile.types";
import { APIClient } from "../base/api-client";

/**
 * Profile API Client
 * Handles all profile-related API requests
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
    const response = await this.get<APIResponse<ProfileExistsResponse>>(
      `${this.basePath}/exists`
    );
    return response.data.exists;
  }

  /**
   * Get current user's profile
   * GET /api/profiles/me
   */
  async getMyProfile(includeDetails = false): Promise<UserProfile> {
    const response = await this.get<APIResponse<UserProfile>>(
      `${this.basePath}/me`,
      { includeDetails }
    );
    return response.data;
  }

  /**
   * Get complete profile with picture details
   * GET /api/profiles/me/complete
   */
  async getCompleteProfile(): Promise<CompleteProfile> {
    const response = await this.get<APIResponse<CompleteProfile>>(
      `${this.basePath}/me/complete`
    );
    return response.data;
  }

  /**
   * Get current user's profile statistics
   * GET /api/profiles/me/stats
   */
  async getMyProfileStats(): Promise<ProfileStats> {
    const response = await this.get<APIResponse<ProfileStats>>(
      `${this.basePath}/me/stats`
    );
    return response.data;
  }

  /**
   * Create a new profile for current user
   * POST /api/profiles
   */
  async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
    const response = await this.post<APIResponse<UserProfile>>(
      this.basePath,
      data
    );
    return response.data;
  }

  /**
   * Update current user's profile
   * PATCH /api/profiles/me
   */
  async updateMyProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    const response = await this.patch<APIResponse<UserProfile>>(
      `${this.basePath}/me`,
      updates
    );
    return response.data;
  }

  /**
   * Soft delete current user's profile
   * DELETE /api/profiles/me
   */
  async deleteMyProfile(): Promise<void> {
    await this.delete<APIResponse<null>>(`${this.basePath}/me`);
  }

  /**
   * Restore current user's soft deleted profile
   * POST /api/profiles/me/restore
   */
  async restoreMyProfile(): Promise<UserProfile> {
    const response = await this.post<APIResponse<UserProfile>>(
      `${this.basePath}/me/restore`
    );
    return response.data;
  }

  /**
   * Search profiles by bio
   * GET /api/profiles/search
   */
  async searchProfiles(
    params: ProfileSearchParams
  ): Promise<ProfileSearchResult> {
    const response = await this.get<APIResponse<ProfileSearchResult>>(
      `${this.basePath}/search`,
      params
    );
    return response.data;
  }

  /**
   * Get multiple profiles by user IDs (batch operation)
   * POST /api/profiles/batch
   */
  async getProfilesByUserIds(
    request: BatchProfilesRequest
  ): Promise<BatchProfilesResult> {
    const response = await this.post<APIResponse<BatchProfilesResult>>(
      `${this.basePath}/batch`,
      request
    );
    return response.data;
  }

  /**
   * Get all profiles with pagination (admin only)
   * GET /api/profiles
   */
  async getAllProfiles(
    params: PaginationParams = {}
  ): Promise<PaginatedProfilesResult> {
    const response = await this.get<APIResponse<PaginatedProfilesResult>>(
      this.basePath,
      params
    );
    return response.data;
  }

  /**
   * Bulk update profiles (admin only)
   * PATCH /api/profiles/bulk
   */
  async bulkUpdateProfiles(
    request: BulkUpdateRequest
  ): Promise<BulkUpdateResult> {
    const response = await this.patch<APIResponse<BulkUpdateResult>>(
      `${this.basePath}/bulk`,
      request
    );
    return response.data;
  }

  /**
   * Get profile by user ID (admin only)
   * GET /api/profiles/user/:userId
   */
  async getProfileByUserId(
    userId: string,
    includeDetails = false
  ): Promise<UserProfile> {
    const response = await this.get<APIResponse<UserProfile>>(
      `${this.basePath}/user/${userId}`,
      { includeDetails }
    );
    return response.data;
  }

  /**
   * Get profile by profile ID (admin only)
   * GET /api/profiles/:profileId
   */
  async getProfileById(
    profileId: string,
    includeDetails = false
  ): Promise<UserProfile> {
    const response = await this.get<APIResponse<UserProfile>>(
      `${this.basePath}/${profileId}`,
      { includeDetails }
    );
    return response.data;
  }

  /**
   * Update profile by profile ID (admin only)
   * PATCH /api/profiles/:profileId
   */
  async updateProfileById(
    profileId: string,
    updates: UpdateProfileRequest
  ): Promise<UserProfile> {
    const response = await this.patch<APIResponse<UserProfile>>(
      `${this.basePath}/${profileId}`,
      updates
    );
    return response.data;
  }

  /**
   * Permanently delete profile (admin only)
   * DELETE /api/profiles/:userId/permanent
   */
  async permanentlyDeleteProfile(userId: string): Promise<void> {
    await this.delete<APIResponse<null>>(
      `${this.basePath}/${userId}/permanent`
    );
  }
}

// Export singleton instance
export const profileAPI = new ProfileAPIClient();
