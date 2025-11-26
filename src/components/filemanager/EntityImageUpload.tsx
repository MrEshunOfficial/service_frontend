"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  useProfilePicture,
  useCategoryCover,
  useServiceCover,
} from "@/hooks/useFileManagement";
import { File } from "@/types/file.types"; // Adjust import path as needed

/**
 * Generic Image Upload Popover Component
 * Can be used for profile pictures, cover images, etc.
 */

interface ImageUploadPopoverProps {
  /** Type of image being uploaded */
  type: "profile" | "category" | "service";
  /** Entity ID (required for category and service types) */
  entityId?: string;
  /** Current image URL to display */
  currentImageUrl?: string;
  /** Callback when upload succeeds */
  onUploadSuccess?: (url: string) => void;
  /** Custom trigger element (defaults to camera icon) */
  trigger?: React.ReactNode;
  /** Accept specific file types */
  accept?: string;
}

export function ImageUploadPopover({
  type,
  entityId,
  onUploadSuccess,
  trigger,
  accept = "image/*",
}: ImageUploadPopoverProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Select appropriate hook based on type
  const profileHook = useProfilePicture();
  const categoryHook = useCategoryCover(entityId || "");
  const serviceHook = useServiceCover(entityId || "");

  const hook =
    type === "profile"
      ? profileHook
      : type === "category"
      ? categoryHook
      : serviceHook;

  const { uploading, error, uploadFile, clearError } = hook;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const result = (await uploadFile(selectedFile)) as File | undefined;

      // Call success callback if provided
      if (onUploadSuccess && result?.url) {
        onUploadSuccess(result.url);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleTriggerClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveError = () => {
    clearError();
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={handleTriggerClick}
        disabled={uploading}
        className="relative"
        type="button">
        {trigger || (
          <div className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? (
              <svg
                className="w-3 h-3 animate-spin text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </div>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {/* Error Toast */}
      {error && (
        <div className="absolute top-full mt-2 right-0 z-50 min-w-[250px] max-w-[350px] bg-red-50 border border-red-200 rounded-lg shadow-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={handleRemoveError}
              className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Usage Examples
 */

// Example 1: Profile Picture in Header
export function ProfileHeader({
  currentImageUrl,
}: {
  currentImageUrl?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Image
          src={currentImageUrl || "/default-avatar.png"}
          alt="Profile"
          width={80}
          height={80}
          className="rounded-full object-cover"
          priority
        />
        <div className="absolute bottom-0 right-0">
          <ImageUploadPopover
            type="profile"
            currentImageUrl={currentImageUrl}
            onUploadSuccess={(url) => console.log("New image:", url)}
          />
        </div>
      </div>
    </div>
  );
}

// Example 2: Category Cover with Custom Trigger
export function CategoryHeader({
  categoryId,
  coverUrl,
}: {
  categoryId: string;
  coverUrl?: string;
}) {
  return (
    <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
      {coverUrl && (
        <Image
          src={coverUrl}
          alt="Cover"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
      <div className="absolute top-4 right-4">
        <ImageUploadPopover
          type="category"
          entityId={categoryId}
          currentImageUrl={coverUrl}
          trigger={
            <div className="px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
              <span className="text-sm font-medium">Change Cover</span>
            </div>
          }
        />
      </div>
    </div>
  );
}

export function ServiceCard({
  serviceId,
  coverUrl,
}: {
  serviceId: string;
  coverUrl?: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="relative aspect-video bg-gray-100 rounded mb-3">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt="Service cover"
            fill
            className="object-cover rounded"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className="absolute top-2 right-2">
          <ImageUploadPopover
            type="service"
            entityId={serviceId}
            currentImageUrl={coverUrl}
          />
        </div>
      </div>
      <h3>Service Title</h3>
    </div>
  );
}
