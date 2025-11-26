// types/profile.types.ts

import { UserRole } from "./base.types";

/**
 * User role enum
 */

/**
 * Base profile interface matching backend response
 */
export interface UserProfile {
  _id: string;
  userId: string;
  role: UserRole;
  bio?: string;
  mobileNumber?: string;
  lastModified: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  profilePictureId?: string;
  id: string;
}

/**
 * Profile with picture details
 */
export interface ProfilePictureDetails {
  _id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface CompleteProfile {
  profile: UserProfile;
  profilePicture?: ProfilePictureDetails; // Changed from pictureDetails to profilePicture
}

/**
 * Profile creation request
 */
export interface CreateProfileRequest {
  role: UserRole;
  bio?: string;
  mobileNumber?: string;
  profilePictureId?: string;
}

/**
 * Profile update request
 */
export interface UpdateProfileRequest {
  role?: UserRole;
  bio?: string;
  mobileNumber?: string;
  profilePictureId?: string;
}

/**
 * Profile statistics
 */
export interface ProfileStats {
  totalProfiles: number;
  activeProfiles: number;
  deletedProfiles: number;
  profilesWithPictures: number;
  profilesWithBio: number;
}

/**
 * Profile search result
 */
export interface ProfileSearchResult {
  profiles: UserProfile[];
  count: number;
  limit: number;
  skip: number;
}

/**
 * Batch profiles result
 */
export interface BatchProfilesResult {
  profiles: UserProfile[];
  count: number;
}

/**
 * Paginated profiles result
 */
export interface PaginatedProfilesResult {
  profiles: UserProfile[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

/**
 * Bulk update result
 */
export interface BulkUpdateResult {
  modifiedCount: number;
  matchedCount: number;
}

/**
 * Profile exists response
 */
export interface ProfileExistsResponse {
  exists: boolean;
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Search parameters
 */
export interface ProfileSearchParams {
  q: string;
  limit?: number;
  skip?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  skip?: number;
  includeDeleted?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Batch request parameters
 */
export interface BatchProfilesRequest {
  userIds: string[];
  includeDetails?: boolean;
}

/**
 * Bulk update request
 */
export interface BulkUpdateRequest {
  userIds: string[];
  updates: UpdateProfileRequest;
}
