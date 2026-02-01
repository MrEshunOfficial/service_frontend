// api/files/provider-file-api-client.ts
import { APIClient } from "../base/api-client";
import { Types } from "mongoose";

/**
 * Provider File Record interface
 */
export interface ProviderFileRecord {
  _id: Types.ObjectId | string;
  uploaderId?: Types.ObjectId;
  providerId?: Types.ObjectId | string;
  extension?: string;
  thumbnailUrl?: string;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  storageProvider: "local" | "s3" | "cloudinary" | "gcs" | "mega";
  metadata?: Record<string, unknown>;
  tags?: string[];
  description?: string;
  entityType?: "provider-id" | "provider-gallery";
  entityId?: Types.ObjectId;
  label?: string;
  status: "active" | "archived";
  lastAccessedAt?: Date;
  uploadedAt: Date;
  deletedAt?: Date;
}

/**
 * API Response types
 */
export interface ProviderFileUploadResponse {
  success: boolean;
  message: string;
  file?: ProviderFileRecord;
  files?: ProviderFileRecord[];
  data?: {
    fileId: string;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    linkedToEntity?: boolean;
    entityExists?: boolean;
  };
}

export interface ProviderFileResponse {
  success: boolean;
  file: ProviderFileRecord;
}

export interface ProviderFilesResponse {
  success: boolean;
  files: ProviderFileRecord[];
  total?: number;
}

export interface ProviderFileHistoryResponse {
  success: boolean;
  files: ProviderFileRecord[];
  total: number;
}

export interface ProviderFileStatsResponse {
  success: boolean;
  stats: {
    totalFiles: number;
    totalSize: number;
    activeFiles: number;
    archivedFiles: number;
  };
}

export interface ProviderFileDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Provider File API Client
 * Handles ID images and gallery images for provider profiles
 */
export class ProviderFileAPIClient extends APIClient {
  private fileEndpoint = "/api/files";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ============================================
  // PROVIDER ID IMAGES - CLOUDINARY OPERATIONS
  // ============================================

  /**
   * Upload multiple ID images (max 2: front and back)
   * Uses authenticated user's ID
   */
  async uploadIdImagesMultiple(
    files: File[]
  ): Promise<ProviderFileUploadResponse> {
    if (files.length > 2) {
      throw new Error("Maximum 2 ID images allowed (front and back)");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("idImages", file);
    });

    const endpoint = `${this.fileEndpoint}/cloudinary/provider/id-images/upload-multiple`;
    const url = this.buildURL(endpoint);

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }

  /**
   * Upload single ID image
   * Uses authenticated user's ID
   */
  async uploadIdImageSingle(file: File): Promise<ProviderFileUploadResponse> {
    const formData = new FormData();
    formData.append("idImage", file);

    const endpoint = `${this.fileEndpoint}/cloudinary/provider/id-images/upload`;
    const url = this.buildURL(endpoint);

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }

  /**
   * Delete ID image from Cloudinary
   * Requires providerId (after profile creation)
   */
  async deleteIdImageCloudinary(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/cloudinary/provider/${providerId}/id-images/${fileId}`;
    return this.delete<ProviderFileDeleteResponse>(endpoint);
  }

  // ============================================
  // PROVIDER ID IMAGES - MONGODB OPERATIONS
  // ============================================

  /**
   * Get all active ID images for a provider
   */
  async getIdImages(providerId: string): Promise<ProviderFilesResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images`;
    return this.get<ProviderFilesResponse>(endpoint);
  }

  /**
   * Get single ID image record
   */
  async getIdImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/${fileId}`;
    return this.get<ProviderFileResponse>(endpoint);
  }

  /**
   * Get ID images history
   */
  async getIdImagesHistory(
    providerId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<ProviderFileHistoryResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/history/all`;
    return this.get<ProviderFileHistoryResponse>(endpoint, params);
  }

  /**
   * Get ID images statistics
   */
  async getIdImagesStats(
    providerId: string
  ): Promise<ProviderFileStatsResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/stats/overview`;
    return this.get<ProviderFileStatsResponse>(endpoint);
  }

  /**
   * Update ID image metadata
   */
  async updateIdImageMetadata(
    providerId: string,
    fileId: string,
    metadata: Record<string, unknown>
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/${fileId}/metadata`;
    return this.patch<ProviderFileResponse>(endpoint, { metadata });
  }

  /**
   * Archive ID image
   */
  async archiveIdImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/${fileId}/archive`;
    return this.post<ProviderFileResponse>(endpoint);
  }

  /**
   * Restore archived ID image
   */
  async restoreIdImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/${fileId}/restore`;
    return this.post<ProviderFileResponse>(endpoint);
  }

  /**
   * Permanently delete ID image
   */
  async deleteIdImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/id-images/${fileId}`;
    return this.delete<ProviderFileDeleteResponse>(endpoint);
  }

  // ============================================
  // PROVIDER GALLERY IMAGES - CLOUDINARY OPERATIONS
  // ============================================

  /**
   * Upload multiple gallery images (max 10 at once)
   * Uses authenticated user's ID
   */
  async uploadGalleryImagesMultiple(
    files: File[]
  ): Promise<ProviderFileUploadResponse> {
    if (files.length > 10) {
      throw new Error("Maximum 10 gallery images allowed per upload");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("galleryImages", file);
    });

    const endpoint = `${this.fileEndpoint}/cloudinary/provider/gallery/upload-multiple`;
    const url = this.buildURL(endpoint);

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }

  /**
   * Upload single gallery image
   * Uses authenticated user's ID
   */
  async uploadGalleryImageSingle(
    file: File
  ): Promise<ProviderFileUploadResponse> {
    const formData = new FormData();
    formData.append("galleryImage", file);

    const endpoint = `${this.fileEndpoint}/cloudinary/provider/gallery/upload`;
    const url = this.buildURL(endpoint);

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }

  /**
   * Get optimized gallery image from Cloudinary (PUBLIC)
   */
  async getOptimizedGalleryImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/cloudinary/provider/${providerId}/gallery/${fileId}/optimized`;
    return this.get<ProviderFileResponse>(endpoint);
  }

  /**
   * Delete gallery image from Cloudinary
   */
  async deleteGalleryImageCloudinary(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/cloudinary/provider/${providerId}/gallery/${fileId}`;
    return this.delete<ProviderFileDeleteResponse>(endpoint);
  }

  // ============================================
  // PROVIDER GALLERY IMAGES - MONGODB OPERATIONS
  // ============================================

  /**
   * Get all active gallery images for a provider (PUBLIC)
   */
  async getGalleryImages(providerId: string): Promise<ProviderFilesResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery`;
    return this.get<ProviderFilesResponse>(endpoint);
  }

  /**
   * Get single gallery image record (PUBLIC)
   */
  async getGalleryImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/${fileId}`;
    return this.get<ProviderFileResponse>(endpoint);
  }

  /**
   * Get gallery images history
   */
  async getGalleryImagesHistory(
    providerId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<ProviderFileHistoryResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/history/all`;
    return this.get<ProviderFileHistoryResponse>(endpoint, params);
  }

  /**
   * Get gallery images statistics
   */
  async getGalleryImagesStats(
    providerId: string
  ): Promise<ProviderFileStatsResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/stats/overview`;
    return this.get<ProviderFileStatsResponse>(endpoint);
  }

  /**
   * Cleanup old archived gallery images
   */
  async cleanupArchivedGalleryImages(
    providerId: string
  ): Promise<ProviderFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/cleanup`;
    return this.delete<ProviderFileDeleteResponse>(endpoint);
  }

  /**
   * Update gallery image metadata
   */
  async updateGalleryImageMetadata(
    providerId: string,
    fileId: string,
    metadata: Record<string, unknown>
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/${fileId}/metadata`;
    return this.patch<ProviderFileResponse>(endpoint, { metadata });
  }

  /**
   * Archive gallery image
   */
  async archiveGalleryImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/${fileId}/archive`;
    return this.post<ProviderFileResponse>(endpoint);
  }

  /**
   * Restore archived gallery image
   */
  async restoreGalleryImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/${fileId}/restore`;
    return this.post<ProviderFileResponse>(endpoint);
  }

  /**
   * Permanently delete gallery image
   */
  async deleteGalleryImage(
    providerId: string,
    fileId: string
  ): Promise<ProviderFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/provider/${providerId}/gallery/${fileId}`;
    return this.delete<ProviderFileDeleteResponse>(endpoint);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if file is valid image
   */
  isValidImage(file: File): boolean {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    return validTypes.includes(file.type);
  }

  /**
   * Check if file size is within limit (5MB default)
   */
  isValidSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate ID image files
   */
  validateIdImages(files: File[]): { valid: boolean; error?: string } {
    if (files.length === 0) {
      return { valid: false, error: "No files provided" };
    }

    if (files.length > 2) {
      return { valid: false, error: "Maximum 2 ID images allowed" };
    }

    for (const file of files) {
      if (!this.isValidImage(file)) {
        return {
          valid: false,
          error: `Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed`,
        };
      }

      if (!this.isValidSize(file, 5)) {
        return {
          valid: false,
          error: `File too large: ${file.name}. Maximum size is 5MB`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate gallery image files
   */
  validateGalleryImages(files: File[]): { valid: boolean; error?: string } {
    if (files.length === 0) {
      return { valid: false, error: "No files provided" };
    }

    if (files.length > 10) {
      return { valid: false, error: "Maximum 10 gallery images allowed per upload" };
    }

    for (const file of files) {
      if (!this.isValidImage(file)) {
        return {
          valid: false,
          error: `Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed`,
        };
      }

      if (!this.isValidSize(file, 5)) {
        return {
          valid: false,
          error: `File too large: ${file.name}. Maximum size is 5MB`,
        };
      }
    }

    return { valid: true };
  }
}

// Export singleton instance
export const providerFileAPI = new ProviderFileAPIClient();