// api/files/file-api-client.ts
import { APIClient } from "../base/api-client";
import { Types } from "mongoose";

/**
 * File document interface (renamed to avoid conflict with browser's File type)
 */
export interface FileRecord {
  _id: Types.ObjectId | string;
  uploaderId?: Types.ObjectId;
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
  entityType?: string;
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
export interface FileUploadResponse {
  success: boolean;
  message: string;
  file: FileRecord;
}

export interface FileResponse {
  success: boolean;
  file: FileRecord;
}

export interface FileHistoryResponse {
  success: boolean;
  files: FileRecord[];
  total: number;
}

export interface FileStatsResponse {
  success: boolean;
  stats: {
    totalFiles: number;
    totalSize: number;
    activeFiles: number;
    archivedFiles: number;
  };
}

export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Entity types for file management
 */
export type EntityType = "profile-picture" | "category" | "service";

/**
 * File API Client
 */
export class FileAPIClient extends APIClient {
  private fileEndpoint = "/api/files";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ============================================
  // CLOUDINARY OPERATIONS
  // ============================================

  /**
   * Upload a file to Cloudinary
   */
  async uploadFile(
    file: File | Blob,
    entityType: EntityType,
    entityId?: string
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = this.getCloudinaryUploadEndpoint(entityType, entityId);
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

    const data = await response.json();

    // Transform API response to match expected interface
    // The API returns 'data' but we expect 'file'
    if (data.data && !data.file) {
      const fileRecord: FileRecord = {
        _id: data.data.fileId,
        url: data.data.url,
        fileName: data.data.url?.split("/").pop() || "uploaded-file",
        thumbnailUrl: data.data.thumbnailUrl,
        storageProvider: "cloudinary",
        status: "active",
        uploadedAt: new Date(),
        fileSize:
          data.data.width && data.data.height
            ? data.data.width * data.data.height
            : undefined,
        metadata: {
          width: data.data.width,
          height: data.data.height,
          linkedToEntity: data.data.linkedToEntity,
          entityExists: data.data.entityExists,
        },
      };

      return {
        success: data.success,
        message: data.message,
        file: fileRecord,
      };
    }

    // If response already has 'file' property, return as-is
    return data;
  }

  /**
   * Get file from Cloudinary
   */
  async getFile(
    entityType: EntityType,
    entityId?: string,
    userId?: string
  ): Promise<FileResponse> {
    const endpoint = this.getCloudinaryGetEndpoint(
      entityType,
      entityId,
      userId
    );
    return this.get<FileResponse>(endpoint);
  }

  /**
   * Get optimized file from Cloudinary
   */
  async getOptimizedFile(
    entityType: EntityType,
    entityId?: string
  ): Promise<FileResponse> {
    const endpoint = this.getCloudinaryOptimizedEndpoint(entityType, entityId);
    return this.get<FileResponse>(endpoint);
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteCloudinaryFile(
    entityType: EntityType,
    entityId?: string
  ): Promise<FileDeleteResponse> {
    const endpoint = this.getCloudinaryDeleteEndpoint(entityType, entityId);
    return this.delete<FileDeleteResponse>(endpoint);
  }

  // ============================================
  // MONGODB OPERATIONS
  // ============================================

  /**
   * Get file record from MongoDB
   */
  async getFileRecord(
    entityType: EntityType,
    entityId?: string,
    userId?: string
  ): Promise<FileResponse> {
    const endpoint = this.getMongoGetEndpoint(entityType, entityId, userId);
    return this.get<FileResponse>(endpoint);
  }

  /**
   * Get file history
   */
  async getFileHistory(
    entityType: EntityType,
    entityId?: string,
    params?: { limit?: number; skip?: number }
  ): Promise<FileHistoryResponse> {
    const endpoint = this.getMongoHistoryEndpoint(entityType, entityId);
    return this.get<FileHistoryResponse>(endpoint, params);
  }

  /**
   * Get file statistics
   */
  async getFileStats(
    entityType: EntityType,
    entityId?: string
  ): Promise<FileStatsResponse> {
    const endpoint = this.getMongoStatsEndpoint(entityType, entityId);
    return this.get<FileStatsResponse>(endpoint);
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    entityType: EntityType,
    metadata: Record<string, unknown>,
    entityId?: string
  ): Promise<FileResponse> {
    const endpoint = this.getMongoMetadataEndpoint(entityType, entityId);
    return this.put<FileResponse>(endpoint, { metadata });
  }

  /**
   * Archive file
   */
  async archiveFile(
    entityType: EntityType,
    entityId?: string
  ): Promise<FileResponse> {
    const endpoint = this.getMongoArchiveEndpoint(entityType, entityId);
    return this.post<FileResponse>(endpoint);
  }

  /**
   * Restore archived file
   */
  async restoreFile(
    entityType: EntityType,
    fileId: string,
    entityId?: string
  ): Promise<FileResponse> {
    const endpoint = this.getMongoRestoreEndpoint(entityType, fileId, entityId);
    return this.post<FileResponse>(endpoint);
  }

  /**
   * Cleanup archived files
   */
  async cleanupArchivedFiles(
    entityType: EntityType,
    entityId?: string
  ): Promise<FileDeleteResponse> {
    const endpoint = this.getMongoCleanupEndpoint(entityType, entityId);
    return this.delete<FileDeleteResponse>(endpoint);
  }

  /**
   * Delete file from MongoDB
   */
  async deleteFileRecord(
    entityType: EntityType,
    entityId?: string
  ): Promise<FileDeleteResponse> {
    const endpoint = this.getMongoDeleteEndpoint(entityType, entityId);
    return this.delete<FileDeleteResponse>(endpoint);
  }

  // ============================================
  // ENDPOINT BUILDERS
  // ============================================

  private getCloudinaryUploadEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/cloudinary/profile-picture`;
    }
    return `${this.fileEndpoint}/cloudinary/${entityType}/${entityId}/cover`;
  }

  private getCloudinaryGetEndpoint(
    entityType: EntityType,
    entityId?: string,
    userId?: string
  ): string {
    if (entityType === "profile-picture") {
      return userId
        ? `${this.fileEndpoint}/cloudinary/profile-picture/${userId}`
        : `${this.fileEndpoint}/cloudinary/profile-picture`;
    }
    return `${this.fileEndpoint}/cloudinary/${entityType}/${entityId}/cover`;
  }

  private getCloudinaryOptimizedEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/cloudinary/profile-picture/optimized`;
    }
    return `${this.fileEndpoint}/cloudinary/${entityType}/${entityId}/cover/optimized`;
  }

  private getCloudinaryDeleteEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/cloudinary/profile-picture`;
    }
    return `${this.fileEndpoint}/cloudinary/${entityType}/${entityId}/cover`;
  }

  private getMongoGetEndpoint(
    entityType: EntityType,
    entityId?: string,
    userId?: string
  ): string {
    if (entityType === "profile-picture") {
      return userId
        ? `${this.fileEndpoint}/profile-picture/${userId}`
        : `${this.fileEndpoint}/profile-picture`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover`;
  }

  private getMongoHistoryEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture/history`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover/history`;
  }

  private getMongoStatsEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture/stats`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover/stats`;
  }

  private getMongoMetadataEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture/metadata`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover/metadata`;
  }

  private getMongoArchiveEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture/archive`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover/archive`;
  }

  private getMongoRestoreEndpoint(
    entityType: EntityType,
    fileId: string,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture/restore/${fileId}`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover/restore/${fileId}`;
  }

  private getMongoCleanupEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture/cleanup`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover/cleanup`;
  }

  private getMongoDeleteEndpoint(
    entityType: EntityType,
    entityId?: string
  ): string {
    if (entityType === "profile-picture") {
      return `${this.fileEndpoint}/profile-picture`;
    }
    return `${this.fileEndpoint}/${entityType}/${entityId}/cover`;
  }
}

// Export singleton instance
export const fileAPI = new FileAPIClient();
