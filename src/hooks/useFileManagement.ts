// hooks/useFileManagement.ts
import {
  FileRecord,
  FileStatsResponse,
  EntityType,
  FileUploadResponse,
  fileAPI,
  FileResponse,
  FileHistoryResponse,
} from "@/lib/api/file-manager/file.manager.api";
import { useState, useCallback } from "react";

/**
 * Hook state interface
 */
interface FileManagementState {
  file: FileRecord | null;
  files: FileRecord[];
  stats: FileStatsResponse["stats"] | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
interface UseFileManagementReturn extends FileManagementState {
  uploadFile: (
    fileToUpload: File | Blob,
    entityId?: string
  ) => Promise<FileRecord>;
  getFile: (entityId?: string, userId?: string) => Promise<void>;
  getOptimizedFile: (entityId?: string) => Promise<void>;
  getFileHistory: (
    entityId?: string,
    params?: { limit?: number; skip?: number }
  ) => Promise<void>;
  getFileStats: (entityId?: string) => Promise<void>;
  updateMetadata: (
    metadata: Record<string, unknown>,
    entityId?: string
  ) => Promise<void>;
  archiveFile: (entityId?: string) => Promise<void>;
  restoreFile: (fileId: string, entityId?: string) => Promise<void>;
  deleteFile: (entityId?: string) => Promise<void>;
  cleanupArchived: (entityId?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for file management
 */
export function useFileManagement(
  entityType: EntityType
): UseFileManagementReturn {
  const [state, setState] = useState<FileManagementState>({
    file: null,
    files: [],
    stats: null,
    loading: false,
    uploading: false,
    error: null,
  });

  /**
   * Upload file - FIXED: Now returns FileRecord
   */
  const uploadFile = useCallback(
    async (
      fileToUpload: File | Blob,
      entityId?: string
    ): Promise<FileRecord> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        const response: FileUploadResponse = await fileAPI.uploadFile(
          fileToUpload,
          entityType,
          entityId
        );

        console.log("API Response:", response);

        if (!response || !response.file) {
          throw new Error(
            "Invalid response from server: No file data returned"
          );
        }

        setState((prev) => ({
          ...prev,
          file: response.file,
          uploading: false,
        }));

        // Return the uploaded file record
        return response.file;
      } catch (error) {
        console.error("Upload error in hook:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload file";
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Get file
   */
  const getFile = useCallback(
    async (entityId?: string, userId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileResponse = await fileAPI.getFile(
          entityType,
          entityId,
          userId
        );
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch file";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Get optimized file
   */
  const getOptimizedFile = useCallback(
    async (entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileResponse = await fileAPI.getOptimizedFile(
          entityType,
          entityId
        );
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch optimized file";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Get file history
   */
  const getFileHistory = useCallback(
    async (entityId?: string, params?: { limit?: number; skip?: number }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileHistoryResponse = await fileAPI.getFileHistory(
          entityType,
          entityId,
          params
        );
        setState((prev) => ({
          ...prev,
          files: response.files,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch file history";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Get file statistics
   */
  const getFileStats = useCallback(
    async (entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileStatsResponse = await fileAPI.getFileStats(
          entityType,
          entityId
        );
        setState((prev) => ({
          ...prev,
          stats: response.stats,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch file stats";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Update file metadata
   */
  const updateMetadata = useCallback(
    async (metadata: Record<string, unknown>, entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileResponse = await fileAPI.updateFileMetadata(
          entityType,
          metadata,
          entityId
        );
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update metadata";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Archive file
   */
  const archiveFile = useCallback(
    async (entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileResponse = await fileAPI.archiveFile(
          entityType,
          entityId
        );
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to archive file";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Restore archived file
   */
  const restoreFile = useCallback(
    async (fileId: string, entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: FileResponse = await fileAPI.restoreFile(
          entityType,
          fileId,
          entityId
        );
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to restore file";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Delete file
   */
  const deleteFile = useCallback(
    async (entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await fileAPI.deleteFileRecord(entityType, entityId);
        setState((prev) => ({
          ...prev,
          file: null,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete file";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Cleanup archived files
   */
  const cleanupArchived = useCallback(
    async (entityId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await fileAPI.cleanupArchivedFiles(entityType, entityId);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to cleanup archived files";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      file: null,
      files: [],
      stats: null,
      loading: false,
      uploading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    getFile,
    getOptimizedFile,
    getFileHistory,
    getFileStats,
    updateMetadata,
    archiveFile,
    restoreFile,
    deleteFile,
    cleanupArchived,
    clearError,
    reset,
  };
}

/**
 * Specialized hooks for specific entity types
 */

export function useProfilePicture() {
  return useFileManagement("profile-picture");
}

export function useCategoryCover(categoryId: string) {
  const hook = useFileManagement("category");

  return {
    ...hook,
    uploadFile: (fileToUpload: File | Blob) =>
      hook.uploadFile(fileToUpload, categoryId),
    getFile: () => hook.getFile(categoryId),
    getOptimizedFile: () => hook.getOptimizedFile(categoryId),
    getFileHistory: (params?: { limit?: number; skip?: number }) =>
      hook.getFileHistory(categoryId, params),
    getFileStats: () => hook.getFileStats(categoryId),
    updateMetadata: (metadata: Record<string, unknown>) =>
      hook.updateMetadata(metadata, categoryId),
    archiveFile: () => hook.archiveFile(categoryId),
    restoreFile: (fileId: string) => hook.restoreFile(fileId, categoryId),
    deleteFile: () => hook.deleteFile(categoryId),
    cleanupArchived: () => hook.cleanupArchived(categoryId),
  };
}

export function useServiceCover(serviceId: string) {
  const hook = useFileManagement("service");

  return {
    ...hook,
    uploadFile: (fileToUpload: File | Blob) =>
      hook.uploadFile(fileToUpload, serviceId),
    getFile: () => hook.getFile(serviceId),
    getOptimizedFile: () => hook.getOptimizedFile(serviceId),
    getFileHistory: (params?: { limit?: number; skip?: number }) =>
      hook.getFileHistory(serviceId, params),
    getFileStats: () => hook.getFileStats(serviceId),
    updateMetadata: (metadata: Record<string, unknown>) =>
      hook.updateMetadata(metadata, serviceId),
    archiveFile: () => hook.archiveFile(serviceId),
    restoreFile: (fileId: string) => hook.restoreFile(fileId, serviceId),
    deleteFile: () => hook.deleteFile(serviceId),
    cleanupArchived: () => hook.cleanupArchived(serviceId),
  };
}
