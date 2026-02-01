// api/files/client-file-api-client.ts
import { APIClient } from "../base/api-client";
import { Types } from "mongoose";

/**
 * Client File Record interface
 */
export interface ClientFileRecord {
  _id: Types.ObjectId | string;
  uploaderId?: Types.ObjectId;
  clientId?: Types.ObjectId | string;
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
  entityType?: "client-id";
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
export interface ClientFileUploadResponse {
  success: boolean;
  message: string;
  file?: ClientFileRecord;
  files?: ClientFileRecord[];
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

export interface ClientFileResponse {
  success: boolean;
  file: ClientFileRecord;
}

export interface ClientFilesResponse {
  success: boolean;
  files: ClientFileRecord[];
  total?: number;
}

export interface ClientFileHistoryResponse {
  success: boolean;
  files: ClientFileRecord[];
  total: number;
}

export interface ClientFileStatsResponse {
  success: boolean;
  stats: {
    totalFiles: number;
    totalSize: number;
    activeFiles: number;
    archivedFiles: number;
  };
}

export interface ClientFileDeleteResponse {
  success: boolean;
  message: string;
}

export interface ClientFileBulkOperationResponse {
  success: boolean;
  message: string;
  affected: number;
}

export interface ClientFileVerifyLinksResponse {
  success: boolean;
  valid: boolean;
  issues?: string[];
}

export interface ClientFileSyncLinksResponse {
  success: boolean;
  message: string;
  synced: number;
}

/**
 * Client File API Client
 * Handles ID images for client profiles with bulk operations
 */
export class ClientFileAPIClient extends APIClient {
  private fileEndpoint = "/api/files";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ============================================
  // CLIENT ID IMAGES - CLOUDINARY OPERATIONS
  // ============================================

  /**
   * Upload multiple ID images (max 5)
   * Uses authenticated user's ID
   */
  async uploadIdImagesMultiple(
    files: File[]
  ): Promise<ClientFileUploadResponse> {
    if (files.length > 5) {
      throw new Error("Maximum 5 ID images allowed");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("idImages", file);
    });

    const endpoint = `${this.fileEndpoint}/cloudinary/client/id-images/upload-multiple`;
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
  async uploadIdImageSingle(file: File): Promise<ClientFileUploadResponse> {
    const formData = new FormData();
    formData.append("idImage", file);

    const endpoint = `${this.fileEndpoint}/cloudinary/client/id-images/upload`;
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
   * Delete single ID image from Cloudinary
   * Requires clientId (after profile creation)
   */
  async deleteIdImageCloudinary(
    clientId: string,
    fileId: string
  ): Promise<ClientFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/cloudinary/client/${clientId}/id-images/${fileId}`;
    return this.delete<ClientFileDeleteResponse>(endpoint);
  }

  /**
   * Delete all ID images from Cloudinary
   * Requires clientId (after profile creation)
   */
  async deleteAllIdImagesCloudinary(
    clientId: string
  ): Promise<ClientFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/cloudinary/client/${clientId}/id-images`;
    return this.delete<ClientFileDeleteResponse>(endpoint);
  }

  // ============================================
  // CLIENT ID IMAGES - MONGODB OPERATIONS
  // ============================================

  /**
   * Get all active ID images for a client
   */
  async getIdImages(clientId: string): Promise<ClientFilesResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images`;
    return this.get<ClientFilesResponse>(endpoint);
  }

  /**
   * Get single ID image record
   */
  async getIdImage(
    clientId: string,
    fileId: string
  ): Promise<ClientFileResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/${fileId}`;
    return this.get<ClientFileResponse>(endpoint);
  }

  /**
   * Get ID images history
   */
  async getIdImagesHistory(
    clientId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<ClientFileHistoryResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/history/all`;
    return this.get<ClientFileHistoryResponse>(endpoint, params);
  }

  /**
   * Get ID images statistics
   */
  async getIdImagesStats(
    clientId: string
  ): Promise<ClientFileStatsResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/stats/overview`;
    return this.get<ClientFileStatsResponse>(endpoint);
  }

  /**
   * Cleanup old archived ID images
   */
  async cleanupArchivedIdImages(
    clientId: string
  ): Promise<ClientFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/cleanup`;
    return this.delete<ClientFileDeleteResponse>(endpoint);
  }

  /**
   * Verify ID image links integrity
   */
  async verifyIdImageLinks(
    clientId: string
  ): Promise<ClientFileVerifyLinksResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/verify-links`;
    return this.get<ClientFileVerifyLinksResponse>(endpoint);
  }

  /**
   * Sync ID image links with client profile
   */
  async syncIdImageLinks(
    clientId: string
  ): Promise<ClientFileSyncLinksResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/sync-links`;
    return this.post<ClientFileSyncLinksResponse>(endpoint);
  }

  /**
   * Update ID image metadata
   */
  async updateIdImageMetadata(
    clientId: string,
    fileId: string,
    metadata: Record<string, unknown>
  ): Promise<ClientFileResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/${fileId}/metadata`;
    return this.patch<ClientFileResponse>(endpoint, { metadata });
  }

  /**
   * Archive ID image
   */
  async archiveIdImage(
    clientId: string,
    fileId: string
  ): Promise<ClientFileResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/${fileId}/archive`;
    return this.post<ClientFileResponse>(endpoint);
  }

  /**
   * Restore archived ID image
   */
  async restoreIdImage(
    clientId: string,
    fileId: string
  ): Promise<ClientFileResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/${fileId}/restore`;
    return this.post<ClientFileResponse>(endpoint);
  }

  /**
   * Permanently delete ID image
   */
  async deleteIdImage(
    clientId: string,
    fileId: string
  ): Promise<ClientFileDeleteResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/${fileId}`;
    return this.delete<ClientFileDeleteResponse>(endpoint);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk archive ID images
   */
  async bulkArchiveIdImages(
    clientId: string,
    fileIds: string[]
  ): Promise<ClientFileBulkOperationResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/bulk-archive`;
    return this.post<ClientFileBulkOperationResponse>(endpoint, { fileIds });
  }

  /**
   * Bulk restore ID images
   */
  async bulkRestoreIdImages(
    clientId: string,
    fileIds: string[]
  ): Promise<ClientFileBulkOperationResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/bulk-restore`;
    return this.post<ClientFileBulkOperationResponse>(endpoint, { fileIds });
  }

  /**
   * Bulk delete ID images
   */
  async bulkDeleteIdImages(
    clientId: string,
    fileIds: string[]
  ): Promise<ClientFileBulkOperationResponse> {
    const endpoint = `${this.fileEndpoint}/client/${clientId}/id-images/bulk-delete`;
    return this.delete<ClientFileBulkOperationResponse>(endpoint);
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

    if (files.length > 5) {
      return { valid: false, error: "Maximum 5 ID images allowed" };
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
   * Validate file IDs for bulk operations
   */
  validateFileIds(fileIds: string[]): { valid: boolean; error?: string } {
    if (!Array.isArray(fileIds)) {
      return { valid: false, error: "File IDs must be an array" };
    }

    if (fileIds.length === 0) {
      return { valid: false, error: "No file IDs provided" };
    }

    for (const id of fileIds) {
      if (typeof id !== "string" || id.trim().length === 0) {
        return { valid: false, error: "Invalid file ID format" };
      }
    }

    return { valid: true };
  }
}

// Export singleton instance
export const clientFileAPI = new ClientFileAPIClient();