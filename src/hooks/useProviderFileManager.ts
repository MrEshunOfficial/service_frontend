// hooks/useProviderFileManagement.ts

import { ProviderFileRecord, ProviderFileStatsResponse, providerFileAPI, ProviderFileUploadResponse, ProviderFilesResponse, ProviderFileResponse, ProviderFileHistoryResponse } from "@/lib/api/file-manager/provider.file.manager";
import { useState, useCallback } from "react";

/**
 * Hook state interface for provider files
 */
interface ProviderFileManagementState {
  file: ProviderFileRecord | null;
  files: ProviderFileRecord[];
  stats: ProviderFileStatsResponse["stats"] | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

/**
 * Hook return type for provider ID images
 */
interface UseProviderIdImagesReturn extends ProviderFileManagementState {
  uploadMultiple: (files: File[]) => Promise<ProviderFileRecord[]>;
  uploadSingle: (file: File) => Promise<ProviderFileRecord>;
  getIdImages: (providerId: string) => Promise<void>;
  getIdImage: (providerId: string, fileId: string) => Promise<void>;
  getHistory: (
    providerId: string,
    params?: { limit?: number; skip?: number }
  ) => Promise<void>;
  getStats: (providerId: string) => Promise<void>;
  updateMetadata: (
    providerId: string,
    fileId: string,
    metadata: Record<string, unknown>
  ) => Promise<void>;
  archive: (providerId: string, fileId: string) => Promise<void>;
  restore: (providerId: string, fileId: string) => Promise<void>;
  deleteFromCloudinary: (providerId: string, fileId: string) => Promise<void>;
  deleteFromMongoDB: (providerId: string, fileId: string) => Promise<void>;
  deleteCompletely: (providerId: string, fileId: string) => Promise<void>;
  validateFiles: (files: File[]) => { valid: boolean; error?: string };
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook return type for provider gallery images
 */
interface UseProviderGalleryImagesReturn extends ProviderFileManagementState {
  uploadMultiple: (files: File[]) => Promise<ProviderFileRecord[]>;
  uploadSingle: (file: File) => Promise<ProviderFileRecord>;
  getGalleryImages: (providerId: string) => Promise<void>;
  getGalleryImage: (providerId: string, fileId: string) => Promise<void>;
  getOptimizedImage: (providerId: string, fileId: string) => Promise<void>;
  getHistory: (
    providerId: string,
    params?: { limit?: number; skip?: number }
  ) => Promise<void>;
  getStats: (providerId: string) => Promise<void>;
  updateMetadata: (
    providerId: string,
    fileId: string,
    metadata: Record<string, unknown>
  ) => Promise<void>;
  archive: (providerId: string, fileId: string) => Promise<void>;
  restore: (providerId: string, fileId: string) => Promise<void>;
  cleanup: (providerId: string) => Promise<void>;
  deleteFromCloudinary: (providerId: string, fileId: string) => Promise<void>;
  deleteFromMongoDB: (providerId: string, fileId: string) => Promise<void>;
  deleteCompletely: (providerId: string, fileId: string) => Promise<void>;
  validateFiles: (files: File[]) => { valid: boolean; error?: string };
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for provider ID images management
 */
export function useProviderIdImages(): UseProviderIdImagesReturn {
  const [state, setState] = useState<ProviderFileManagementState>({
    file: null,
    files: [],
    stats: null,
    loading: false,
    uploading: false,
    error: null,
  });

  /**
   * Upload multiple ID images (max 2)
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<ProviderFileRecord[]> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        // Validate files first
        const validation = providerFileAPI.validateIdImages(files);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ProviderFileUploadResponse =
          await providerFileAPI.uploadIdImagesMultiple(files);

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
    async (file: File): Promise<ProviderFileRecord> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        // Validate file
        const validation = providerFileAPI.validateIdImages([file]);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ProviderFileUploadResponse =
          await providerFileAPI.uploadIdImageSingle(file);

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
  const getIdImages = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFilesResponse =
        await providerFileAPI.getIdImages(providerId);
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
  const getIdImage = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileResponse =
          await providerFileAPI.getIdImage(providerId, fileId);
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
    },
    []
  );

  /**
   * Get ID images history
   */
  const getHistory = useCallback(
    async (
      providerId: string,
      params?: { limit?: number; skip?: number }
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileHistoryResponse =
          await providerFileAPI.getIdImagesHistory(providerId, params);
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
  const getStats = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFileStatsResponse =
        await providerFileAPI.getIdImagesStats(providerId);
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
   * Update ID image metadata
   */
  const updateMetadata = useCallback(
    async (
      providerId: string,
      fileId: string,
      metadata: Record<string, unknown>
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileResponse =
          await providerFileAPI.updateIdImageMetadata(
            providerId,
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
  const archive = useCallback(async (providerId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFileResponse =
        await providerFileAPI.archiveIdImage(providerId, fileId);
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
  const restore = useCallback(async (providerId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFileResponse =
        await providerFileAPI.restoreIdImage(providerId, fileId);
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
   * Delete ID image from Cloudinary only
   */
  const deleteFromCloudinary = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await providerFileAPI.deleteIdImageCloudinary(providerId, fileId);
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
   * Delete ID image from MongoDB only
   */
  const deleteFromMongoDB = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await providerFileAPI.deleteIdImage(providerId, fileId);
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
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Delete from Cloudinary first
        await providerFileAPI.deleteIdImageCloudinary(providerId, fileId);
        // Then delete from MongoDB
        await providerFileAPI.deleteIdImage(providerId, fileId);

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
   * Validate ID image files
   */
  const validateFiles = useCallback((files: File[]) => {
    return providerFileAPI.validateIdImages(files);
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
    updateMetadata,
    archive,
    restore,
    deleteFromCloudinary,
    deleteFromMongoDB,
    deleteCompletely,
    validateFiles,
    clearError,
    reset,
  };
}

/**
 * Custom hook for provider gallery images management
 */
export function useProviderGalleryImages(): UseProviderGalleryImagesReturn {
  const [state, setState] = useState<ProviderFileManagementState>({
    file: null,
    files: [],
    stats: null,
    loading: false,
    uploading: false,
    error: null,
  });

  /**
   * Upload multiple gallery images (max 10)
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<ProviderFileRecord[]> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        // Validate files first
        const validation = providerFileAPI.validateGalleryImages(files);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ProviderFileUploadResponse =
          await providerFileAPI.uploadGalleryImagesMultiple(files);

        console.log("Upload gallery images response:", response);

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
          error instanceof Error
            ? error.message
            : "Failed to upload gallery images";
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
   * Upload single gallery image
   */
  const uploadSingle = useCallback(
    async (file: File): Promise<ProviderFileRecord> => {
      setState((prev) => ({ ...prev, uploading: true, error: null }));

      try {
        // Validate file
        const validation = providerFileAPI.validateGalleryImages([file]);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const response: ProviderFileUploadResponse =
          await providerFileAPI.uploadGalleryImageSingle(file);

        console.log("Upload gallery image response:", response);

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
          error instanceof Error
            ? error.message
            : "Failed to upload gallery image";
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
   * Get all gallery images (PUBLIC)
   */
  const getGalleryImages = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFilesResponse =
        await providerFileAPI.getGalleryImages(providerId);
      setState((prev) => ({
        ...prev,
        files: response.files,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch gallery images";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Get single gallery image (PUBLIC)
   */
  const getGalleryImage = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileResponse =
          await providerFileAPI.getGalleryImage(providerId, fileId);
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch gallery image";
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
   * Get optimized gallery image (PUBLIC)
   */
  const getOptimizedImage = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileResponse =
          await providerFileAPI.getOptimizedGalleryImage(providerId, fileId);
        setState((prev) => ({
          ...prev,
          file: response.file,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch optimized image";
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
   * Get gallery images history
   */
  const getHistory = useCallback(
    async (
      providerId: string,
      params?: { limit?: number; skip?: number }
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileHistoryResponse =
          await providerFileAPI.getGalleryImagesHistory(providerId, params);
        setState((prev) => ({
          ...prev,
          files: response.files,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch gallery history";
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
   * Get gallery images statistics
   */
  const getStats = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFileStatsResponse =
        await providerFileAPI.getGalleryImagesStats(providerId);
      setState((prev) => ({
        ...prev,
        stats: response.stats,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch gallery stats";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Update gallery image metadata
   */
  const updateMetadata = useCallback(
    async (
      providerId: string,
      fileId: string,
      metadata: Record<string, unknown>
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ProviderFileResponse =
          await providerFileAPI.updateGalleryImageMetadata(
            providerId,
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
   * Archive gallery image
   */
  const archive = useCallback(async (providerId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFileResponse =
        await providerFileAPI.archiveGalleryImage(providerId, fileId);
      setState((prev) => ({
        ...prev,
        file: response.file,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to archive gallery image";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Restore archived gallery image
   */
  const restore = useCallback(async (providerId: string, fileId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ProviderFileResponse =
        await providerFileAPI.restoreGalleryImage(providerId, fileId);
      setState((prev) => ({
        ...prev,
        file: response.file,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to restore gallery image";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Cleanup old archived gallery images
   */
  const cleanup = useCallback(async (providerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await providerFileAPI.cleanupArchivedGalleryImages(providerId);
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
   * Delete gallery image from Cloudinary only
   */
  const deleteFromCloudinary = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await providerFileAPI.deleteGalleryImageCloudinary(providerId, fileId);
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
   * Delete gallery image from MongoDB only
   */
  const deleteFromMongoDB = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await providerFileAPI.deleteGalleryImage(providerId, fileId);
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
   * Delete gallery image completely (both Cloudinary and MongoDB)
   */
  const deleteCompletely = useCallback(
    async (providerId: string, fileId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Delete from Cloudinary first
        await providerFileAPI.deleteGalleryImageCloudinary(providerId, fileId);
        // Then delete from MongoDB
        await providerFileAPI.deleteGalleryImage(providerId, fileId);

        setState((prev) => ({
          ...prev,
          file: null,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete gallery image";
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
   * Validate gallery image files
   */
  const validateFiles = useCallback((files: File[]) => {
    return providerFileAPI.validateGalleryImages(files);
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
    getGalleryImages,
    getGalleryImage,
    getOptimizedImage,
    getHistory,
    getStats,
    updateMetadata,
    archive,
    restore,
    cleanup,
    deleteFromCloudinary,
    deleteFromMongoDB,
    deleteCompletely,
    validateFiles,
    clearError,
    reset,
  };
}

/**
 * Specialized hook for specific provider (combines ID and Gallery)
 */
export function useProviderFiles(providerId: string) {
  const idImages = useProviderIdImages();
  const galleryImages = useProviderGalleryImages();

  return {
    idImages: {
      ...idImages,
      getAll: () => idImages.getIdImages(providerId),
      get: (fileId: string) => idImages.getIdImage(providerId, fileId),
      getHistory: (params?: { limit?: number; skip?: number }) =>
        idImages.getHistory(providerId, params),
      getStats: () => idImages.getStats(providerId),
      updateMetadata: (fileId: string, metadata: Record<string, unknown>) =>
        idImages.updateMetadata(providerId, fileId, metadata),
      archive: (fileId: string) => idImages.archive(providerId, fileId),
      restore: (fileId: string) => idImages.restore(providerId, fileId),
      deleteFromCloudinary: (fileId: string) =>
        idImages.deleteFromCloudinary(providerId, fileId),
      deleteFromMongoDB: (fileId: string) =>
        idImages.deleteFromMongoDB(providerId, fileId),
      delete: (fileId: string) => idImages.deleteCompletely(providerId, fileId),
    },
    gallery: {
      ...galleryImages,
      getAll: () => galleryImages.getGalleryImages(providerId),
      get: (fileId: string) => galleryImages.getGalleryImage(providerId, fileId),
      getOptimized: (fileId: string) =>
        galleryImages.getOptimizedImage(providerId, fileId),
      getHistory: (params?: { limit?: number; skip?: number }) =>
        galleryImages.getHistory(providerId, params),
      getStats: () => galleryImages.getStats(providerId),
      updateMetadata: (fileId: string, metadata: Record<string, unknown>) =>
        galleryImages.updateMetadata(providerId, fileId, metadata),
      archive: (fileId: string) => galleryImages.archive(providerId, fileId),
      restore: (fileId: string) => galleryImages.restore(providerId, fileId),
      cleanup: () => galleryImages.cleanup(providerId),
      deleteFromCloudinary: (fileId: string) =>
        galleryImages.deleteFromCloudinary(providerId, fileId),
      deleteFromMongoDB: (fileId: string) =>
        galleryImages.deleteFromMongoDB(providerId, fileId),
      delete: (fileId: string) =>
        galleryImages.deleteCompletely(providerId, fileId),
    },
  };
}