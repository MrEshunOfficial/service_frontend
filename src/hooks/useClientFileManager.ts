// hooks/useClientFileManagement.ts

import { ClientFileRecord, ClientFileStatsResponse, ClientFileVerifyLinksResponse, ClientFileSyncLinksResponse, ClientFileBulkOperationResponse, clientFileAPI, ClientFileUploadResponse, ClientFilesResponse, ClientFileResponse, ClientFileHistoryResponse } from "@/lib/api/file-manager/client.file.manager";
import { useState, useCallback } from "react";

/**
 * Hook state interface for client files
 */
interface ClientFileManagementState {
  file: ClientFileRecord | null;
  files: ClientFileRecord[];
  stats: ClientFileStatsResponse["stats"] | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

/**
 * Hook return type for client ID images
 */
interface UseClientIdImagesReturn extends ClientFileManagementState {
  uploadMultiple: (files: File[]) => Promise<ClientFileRecord[]>;
  uploadSingle: (file: File) => Promise<ClientFileRecord>;
  getIdImages: (clientId: string) => Promise<void>;
  getIdImage: (clientId: string, fileId: string) => Promise<void>;
  getHistory: (
    clientId: string,
    params?: { limit?: number; skip?: number }
  ) => Promise<void>;
  getStats: (clientId: string) => Promise<void>;
  verifyLinks: (clientId: string) => Promise<ClientFileVerifyLinksResponse>;
  syncLinks: (clientId: string) => Promise<ClientFileSyncLinksResponse>;
  updateMetadata: (
    clientId: string,
    fileId: string,
    metadata: Record<string, unknown>
  ) => Promise<void>;
  archive: (clientId: string, fileId: string) => Promise<void>;
  restore: (clientId: string, fileId: string) => Promise<void>;
  cleanup: (clientId: string) => Promise<void>;
  deleteFromCloudinary: (clientId: string, fileId: string) => Promise<void>;
  deleteAllFromCloudinary: (clientId: string) => Promise<void>;
  deleteFromMongoDB: (clientId: string, fileId: string) => Promise<void>;
  deleteCompletely: (clientId: string, fileId: string) => Promise<void>;
  bulkArchive: (
    clientId: string,
    fileIds: string[]
  ) => Promise<ClientFileBulkOperationResponse>;
  bulkRestore: (
    clientId: string,
    fileIds: string[]
  ) => Promise<ClientFileBulkOperationResponse>;
  bulkDelete: (
    clientId: string,
    fileIds: string[]
  ) => Promise<ClientFileBulkOperationResponse>;
  validateFiles: (files: File[]) => { valid: boolean; error?: string };
  validateFileIds: (fileIds: string[]) => { valid: boolean; error?: string };
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for client ID images management
 */
export function useClientIdImages(): UseClientIdImagesReturn {
  const [state, setState] = useState<ClientFileManagementState>({
    file: null,
    files: [],
    stats: null,
    loading: false,
    uploading: false,
    error: null,
  });

  /**
   * Upload multiple ID images (max 5)
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<ClientFileRecord[]> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        // Validate files first
        const validation = clientFileAPI.validateIdImages(files);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ClientFileUploadResponse =
          await clientFileAPI.uploadIdImagesMultiple(files);

        console.log("Upload ID images response:", response);

        const uploadedFiles = response.files || [];

        setState((prev) => ({
          ...prev,
          files: uploadedFiles,
          uploading: false,
        }));

        return uploadedFiles;
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload ID images";
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Upload single ID image
   */
  const uploadSingle = useCallback(
    async (file: File): Promise<ClientFileRecord> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        // Validate file
        const validation = clientFileAPI.validateIdImages([file]);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ClientFileUploadResponse =
          await clientFileAPI.uploadIdImageSingle(file);

        console.log("Upload ID image response:", response);

        if (!response.file) {
          throw new Error("No file data returned from server");
        }

        setState((prev) => ({
          ...prev,
          file: response.file!,
          uploading: false,
        }));

        return response.file;
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload ID image";
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Get all ID images
   */
  const getIdImages = useCallback(async (clientId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ClientFilesResponse =
        await clientFileAPI.getIdImages(clientId);
      setState((prev) => ({
        ...prev,
        files: response.files,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch ID images";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Get single ID image
   */
  const getIdImage = useCallback(async (clientId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ClientFileResponse = await clientFileAPI.getIdImage(
        clientId,
        fileId
      );
      setState((prev) => ({
        ...prev,
        file: response.file,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch ID image";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Get ID images history
   */
  const getHistory = useCallback(
    async (clientId: string, params?: { limit?: number; skip?: number }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ClientFileHistoryResponse =
          await clientFileAPI.getIdImagesHistory(clientId, params);
        setState((prev) => ({
          ...prev,
          files: response.files,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch ID images history";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Get ID images statistics
   */
  const getStats = useCallback(async (clientId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ClientFileStatsResponse =
        await clientFileAPI.getIdImagesStats(clientId);
      setState((prev) => ({
        ...prev,
        stats: response.stats,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch ID images stats";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Verify ID image links integrity
   */
  const verifyLinks = useCallback(
    async (clientId: string): Promise<ClientFileVerifyLinksResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ClientFileVerifyLinksResponse =
          await clientFileAPI.verifyIdImageLinks(clientId);
        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to verify links";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Sync ID image links with client profile
   */
  const syncLinks = useCallback(
    async (clientId: string): Promise<ClientFileSyncLinksResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ClientFileSyncLinksResponse =
          await clientFileAPI.syncIdImageLinks(clientId);
        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to sync links";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Update ID image metadata
   */
  const updateMetadata = useCallback(
    async (
      clientId: string,
      fileId: string,
      metadata: Record<string, unknown>
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ClientFileResponse =
          await clientFileAPI.updateIdImageMetadata(
            clientId,
            fileId,
            metadata
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
    []
  );

  /**
   * Archive ID image
   */
  const archive = useCallback(async (clientId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ClientFileResponse = await clientFileAPI.archiveIdImage(
        clientId,
        fileId
      );
      setState((prev) => ({
        ...prev,
        file: response.file,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to archive ID image";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Restore archived ID image
   */
  const restore = useCallback(async (clientId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ClientFileResponse = await clientFileAPI.restoreIdImage(
        clientId,
        fileId
      );
      setState((prev) => ({
        ...prev,
        file: response.file,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to restore ID image";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Cleanup old archived ID images
   */
  const cleanup = useCallback(async (clientId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await clientFileAPI.cleanupArchivedIdImages(clientId);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cleanup archives";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Delete ID image from Cloudinary only
   */
  const deleteFromCloudinary = useCallback(
    async (clientId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await clientFileAPI.deleteIdImageCloudinary(clientId, fileId);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete from Cloudinary";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Delete all ID images from Cloudinary
   */
  const deleteAllFromCloudinary = useCallback(async (clientId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await clientFileAPI.deleteAllIdImagesCloudinary(clientId);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete all from Cloudinary";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Delete ID image from MongoDB only
   */
  const deleteFromMongoDB = useCallback(
    async (clientId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await clientFileAPI.deleteIdImage(clientId, fileId);
        setState((prev) => ({
          ...prev,
          file: null,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete from MongoDB";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Delete ID image completely (both Cloudinary and MongoDB)
   */
  const deleteCompletely = useCallback(
    async (clientId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Delete from Cloudinary first
        await clientFileAPI.deleteIdImageCloudinary(clientId, fileId);
        // Then delete from MongoDB
        await clientFileAPI.deleteIdImage(clientId, fileId);

        setState((prev) => ({
          ...prev,
          file: null,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete ID image";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Bulk archive ID images
   */
  const bulkArchive = useCallback(
    async (
      clientId: string,
      fileIds: string[]
    ): Promise<ClientFileBulkOperationResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Validate file IDs
        const validation = clientFileAPI.validateFileIds(fileIds);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ClientFileBulkOperationResponse =
          await clientFileAPI.bulkArchiveIdImages(clientId, fileIds);

        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to bulk archive";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Bulk restore ID images
   */
  const bulkRestore = useCallback(
    async (
      clientId: string,
      fileIds: string[]
    ): Promise<ClientFileBulkOperationResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Validate file IDs
        const validation = clientFileAPI.validateFileIds(fileIds);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ClientFileBulkOperationResponse =
          await clientFileAPI.bulkRestoreIdImages(clientId, fileIds);

        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to bulk restore";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Bulk delete ID images
   */
  const bulkDelete = useCallback(
    async (
      clientId: string,
      fileIds: string[]
    ): Promise<ClientFileBulkOperationResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Validate file IDs
        const validation = clientFileAPI.validateFileIds(fileIds);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ClientFileBulkOperationResponse =
          await clientFileAPI.bulkDeleteIdImages(clientId, fileIds);

        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to bulk delete";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Validate ID image files
   */
  const validateFiles = useCallback((files: File[]) => {
    return clientFileAPI.validateIdImages(files);
  }, []);

  /**
   * Validate file IDs for bulk operations
   */
  const validateFileIds = useCallback((fileIds: string[]) => {
    return clientFileAPI.validateFileIds(fileIds);
  }, []);

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
    uploadMultiple,
    uploadSingle,
    getIdImages,
    getIdImage,
    getHistory,
    getStats,
    verifyLinks,
    syncLinks,
    updateMetadata,
    archive,
    restore,
    cleanup,
    deleteFromCloudinary,
    deleteAllFromCloudinary,
    deleteFromMongoDB,
    deleteCompletely,
    bulkArchive,
    bulkRestore,
    bulkDelete,
    validateFiles,
    validateFileIds,
    clearError,
    reset,
  };
}

/**
 * Specialized hook for specific client (with scoped methods)
 */
export function useClientFiles(clientId: string) {
  const idImages = useClientIdImages();

  return {
    ...idImages,
    getAll: () => idImages.getIdImages(clientId),
    get: (fileId: string) => idImages.getIdImage(clientId, fileId),
    getHistory: (params?: { limit?: number; skip?: number }) =>
      idImages.getHistory(clientId, params),
    getStats: () => idImages.getStats(clientId),
    verifyLinks: () => idImages.verifyLinks(clientId),
    syncLinks: () => idImages.syncLinks(clientId),
    updateMetadata: (fileId: string, metadata: Record<string, unknown>) =>
      idImages.updateMetadata(clientId, fileId, metadata),
    archive: (fileId: string) => idImages.archive(clientId, fileId),
    restore: (fileId: string) => idImages.restore(clientId, fileId),
    cleanup: () => idImages.cleanup(clientId),
    deleteFromCloudinary: (fileId: string) =>
      idImages.deleteFromCloudinary(clientId, fileId),
    deleteAllFromCloudinary: () => idImages.deleteAllFromCloudinary(clientId),
    deleteFromMongoDB: (fileId: string) =>
      idImages.deleteFromMongoDB(clientId, fileId),
    delete: (fileId: string) => idImages.deleteCompletely(clientId, fileId),
    bulkArchive: (fileIds: string[]) => idImages.bulkArchive(clientId, fileIds),
    bulkRestore: (fileIds: string[]) => idImages.bulkRestore(clientId, fileIds),
    bulkDelete: (fileIds: string[]) => idImages.bulkDelete(clientId, fileIds),
  };
}