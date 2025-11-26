// components/shared/ImageUploadWithPreview.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useFileManagement } from "@/hooks/useFileManagement";
import { EntityType } from "@/lib/api/file-manager/file.manager.api";

interface ImageUploadWithPreviewProps {
  type: "profile" | "category" | "service" | "cover";
  entityId?: string;
  value?: string | File;
  onUploadComplete?: (fileId: string) => void;
  onUploadError?: (error: string) => void;
  onRemove?: () => void;
  accept?: string;
  aspectRatio?: "square" | "video" | "banner" | "auto";
  maxSizeMB?: number;
  showRemove?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function ImageUploadWithPreview({
  type,
  entityId,
  value,
  onUploadComplete,
  onUploadError,
  onRemove,
  accept = "image/*",
  aspectRatio = "auto",
  maxSizeMB = 5,
  showRemove = true,
  placeholder,
  disabled = false,
  error: externalError,
}: ImageUploadWithPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const getEntityType = (): EntityType => {
    switch (type) {
      case "profile":
        return "profile-picture";
      case "category":
        return "category";
      case "service":
        return "service";
      default:
        return "profile-picture";
    }
  };

  const {
    uploading,
    error: uploadError,
    uploadFile,
    clearError,
  } = useFileManagement(getEntityType());

  const error = externalError || internalError || uploadError;
  const isProcessing = uploading;

  // Get preview URL
  const getPreviewUrl = () => {
    if (!value) return preview;
    if (typeof value === "string") return value;
    return preview;
  };

  const previewUrl = getPreviewUrl();

  // Validate file
  const validateFile = (file: File): string | null => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file";
    }

    return null;
  };

  // Handle file selection - FIXED
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setInternalError(validationError);
      return;
    }

    // Clear errors
    setInternalError(null);
    clearError();

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      // Upload file and get the returned FileRecord
      const uploadedFile = await uploadFile(file, entityId);

      console.log("Upload successful, returned file:", uploadedFile);

      // Validate the response
      if (!uploadedFile) {
        throw new Error("Upload returned null or undefined");
      }

      if (!uploadedFile._id) {
        console.error("Upload returned file without _id:", uploadedFile);
        throw new Error("Upload completed but no file ID returned");
      }

      // Extract file ID - handle both ObjectId and string formats
      const fileId =
        typeof uploadedFile._id === "string"
          ? uploadedFile._id
          : uploadedFile._id.toString();

      setUploadedFileId(fileId);
      onUploadComplete?.(fileId);
      console.log("✓ Upload successful, file ID:", fileId);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload failed:", err);

      // Clean up preview
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPreview(null);

      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setInternalError(errorMessage);
      onUploadError?.(errorMessage);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isProcessing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle remove
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setInternalError(null);
    setUploadedFileId(null);
    onRemove?.();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle click
  const handleClick = () => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "banner":
        return "aspect-[21/9]";
      default:
        return "aspect-video";
    }
  };

  // Get default placeholder
  const getDefaultPlaceholder = () => {
    switch (type) {
      case "profile":
        return "Upload profile picture";
      case "category":
        return "Upload category cover";
      case "service":
        return "Upload service image";
      case "cover":
        return "Upload cover image";
      default:
        return "Upload image";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="w-full">
      <div
        className={`
          relative w-full ${getAspectRatioClass()} 
          border-2 border-dashed rounded-lg overflow-hidden
          transition-all duration-200
          ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }
          ${
            disabled || isProcessing
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${error ? "border-red-300 dark:border-red-700" : ""}
          ${
            uploadedFileId && !error
              ? "border-emerald-300 dark:border-emerald-700"
              : ""
          }
        `}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}>
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className={`object-cover ${
                type === "profile" ? "object-center" : ""
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Upload Success Indicator */}
            {uploadedFileId && !isProcessing && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            {/* Loading Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}

            {/* Hover Actions */}
            {!isProcessing && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={disabled || isProcessing}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50">
                  Change
                </button>
                {showRemove && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled || isProcessing}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50">
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {isProcessing ? (
              <>
                <Loader2 className="w-12 h-12 text-teal-500 dark:text-teal-400 mb-3 animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {placeholder || getDefaultPlaceholder()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {dragActive
                    ? "Drop image here"
                    : "Click to browse or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Max size: {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || isProcessing}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {uploadedFileId && !error && !isProcessing && (
        <div className="mt-2 flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Image uploaded successfully</span>
        </div>
      )}
    </div>
  );
}
