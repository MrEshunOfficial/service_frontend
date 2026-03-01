"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Eye,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";
import { ProviderFileRecord } from "@/lib/api/file-manager/provider.file.manager";
import Image from "next/image";
import { useProviderGalleryImages } from "@/hooks/useProviderFileManager";
import { cn } from "@/lib/utils/utils";

interface ProviderGalleryProps {
  profile: PopulatedProviderProfile;
  onGalleryUpdate?: () => void;
}

interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isExisting: boolean;
  record?: ProviderFileRecord;
}

interface UploadPreview {
  file: File;
  previewUrl: string;
  id: string;
  uploading: boolean;
  error?: string;
  done: boolean;
}

const MAX_GALLERY_IMAGES = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ProviderGallery: React.FC<ProviderGalleryProps> = ({
  profile,
  onGalleryUpdate,
}) => {
  const providerId = profile._id.toString();

  const {
    files = [], // Add default value here
    loading,
    uploading,
    error,
    getGalleryImages,
    uploadSingle,
    deleteCompletely,
    validateFiles,
    clearError,
  } = useProviderGalleryImages();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Previews for pending uploads
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  // Track which existing image is pending deletion
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  // Drag-over state
  const [isDragOver, setIsDragOver] = useState(false);

  // Load gallery on mount
  useEffect(() => {
    if (providerId) {
      getGalleryImages(providerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  // Build existing images list from hook state (or fall back to profile prop)
  const existingImages: GalleryImage[] = (
    files.length > 0
      ? files
      : (profile.BusinessGalleryImages ?? []).filter(
          (img) => typeof img === "object",
        )
  ).map((record) => ({
    id: record._id as string,
    url: record.url,
    thumbnailUrl: record.thumbnailUrl,
    isExisting: true,
    record: record as ProviderFileRecord,
  }));

  const totalCount =
    existingImages.length + previews.filter((p) => !p.done).length;
  const canAddMore = totalCount < MAX_GALLERY_IMAGES;

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const fileArray = Array.from(selectedFiles);

      // Check total limit
      const slotsLeft = MAX_GALLERY_IMAGES - existingImages.length;
      if (slotsLeft <= 0) return;

      const filesToAdd = fileArray.slice(0, slotsLeft);

      const validation = validateFiles(filesToAdd);
      if (!validation.valid) {
        // Surface validation error via the hook's error state – re-throw shape
        console.error("Validation failed:", validation.error);
        return;
      }

      const newPreviews: UploadPreview[] = filesToAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: `preview-${Date.now()}-${Math.random()}`,
        uploading: false,
        done: false,
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);

      // Kick off uploads immediately
      newPreviews.forEach((preview) => uploadPreview(preview));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingImages.length, validateFiles],
  );

  const uploadPreview = async (preview: UploadPreview) => {
    setPreviews((prev) =>
      prev.map((p) => (p.id === preview.id ? { ...p, uploading: true } : p)),
    );

    try {
      await uploadSingle(preview.file);

      // Mark done, refresh gallery
      setPreviews((prev) =>
        prev.map((p) =>
          p.id === preview.id ? { ...p, uploading: false, done: true } : p,
        ),
      );

      await getGalleryImages(providerId);
      onGalleryUpdate?.();

      // Clean up preview after short delay
      setTimeout(() => {
        setPreviews((prev) => prev.filter((p) => p.id !== preview.id));
        URL.revokeObjectURL(preview.previewUrl);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setPreviews((prev) =>
        prev.map((p) =>
          p.id === preview.id ? { ...p, uploading: false, error: msg } : p,
        ),
      );
    }
  };

  const retryPreview = (preview: UploadPreview) => {
    setPreviews((prev) =>
      prev.map((p) => (p.id === preview.id ? { ...p, error: undefined } : p)),
    );
    uploadPreview(preview);
  };

  const removePreview = (previewId: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === previewId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== previewId);
    });
  };

  // ── Deletion ────────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCompletely(providerId, deleteTarget.id);
      await getGalleryImages(providerId);
      onGalleryUpdate?.();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const isEmpty = existingImages.length === 0 && previews.length === 0;

  return (
    <>
      <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Business Gallery
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Showcase your work — up to {MAX_GALLERY_IMAGES} images
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {existingImages.length} / {MAX_GALLERY_IMAGES}
              </Badge>

              {canAddMore && (
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload Images
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading skeleton */}
          {loading && existingImages.length === 0 && previews.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty state with drop zone */}
          {isEmpty && !loading && (
            <DropZone
              isDragOver={isDragOver}
              canAdd={canAddMore}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            />
          )}

          {/* Gallery grid */}
          {!isEmpty && (
            <div
              className={cn(
                "grid grid-cols-2 md:grid-cols-4 gap-4",
                isDragOver && "ring-2 ring-blue-400 ring-offset-2 rounded-lg",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Existing images */}
              {existingImages.map((img) => (
                <ExistingImageCard
                  key={img.id}
                  image={img}
                  onDelete={() => setDeleteTarget(img)}
                  onView={() => setLightboxImg(img.url)}
                />
              ))}

              {/* Upload previews */}
              {previews.map((preview) => (
                <PreviewCard
                  key={preview.id}
                  preview={preview}
                  onRemove={() => removePreview(preview.id)}
                  onRetry={() => retryPreview(preview)}
                />
              ))}

              {/* Add more tile */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs font-medium">Add more</span>
                </button>
              )}
            </div>
          )}

          {/* Accepted types hint */}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Accepted formats: JPEG, PNG, WebP · Max 10 images total
          </p>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
        // Reset so the same file can be re-selected after removal
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the image from your gallery and
              Cloudinary. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-slate-300"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImg}
              alt="Gallery preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface DropZoneProps {
  isDragOver: boolean;
  canAdd: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  isDragOver,
  canAdd,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}) => (
  <div
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={canAdd ? onClick : undefined}
    className={cn(
      "border-2 border-dashed rounded-xl py-16 flex flex-col items-center justify-center gap-3 transition-all",
      canAdd
        ? "cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        : "opacity-60 cursor-not-allowed",
      isDragOver
        ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20 scale-[1.01]"
        : "border-slate-300 dark:border-slate-600",
    )}
  >
    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700">
      <ImageIcon className="w-10 h-10 text-slate-400" />
    </div>
    <div className="text-center">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {isDragOver ? "Drop images here" : "No Gallery Images"}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {canAdd
          ? "Drag & drop or click to upload images"
          : "Gallery is full (10/10)"}
      </p>
    </div>
    {canAdd && (
      <Button size="sm" variant="outline">
        <Upload className="w-4 h-4 mr-2" />
        Upload Images
      </Button>
    )}
  </div>
);

interface ExistingImageCardProps {
  image: GalleryImage;
  onDelete: () => void;
  onView: () => void;
}

const ExistingImageCard: React.FC<ExistingImageCardProps> = ({
  image,
  onDelete,
  onView,
}) => (
  <div className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow aspect-square bg-slate-100 dark:bg-slate-800">
    <Image
      src={image.thumbnailUrl || image.url}
      alt="Gallery image"
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      className="object-cover group-hover:scale-105 transition-transform duration-300"
    />

    {/* Overlay actions */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
      <button
        type="button"
        onClick={onView}
        className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 transition-colors shadow"
        title="View full size"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white transition-colors shadow"
        title="Remove image"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

interface PreviewCardProps {
  preview: UploadPreview;
  onRemove: () => void;
  onRetry: () => void;
}

const PreviewCard: React.FC<PreviewCardProps> = ({
  preview,
  onRemove,
  onRetry,
}) => (
  <div className="relative overflow-hidden rounded-lg aspect-square bg-slate-100 dark:bg-slate-800 shadow-sm">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={preview.previewUrl}
      alt="Upload preview"
      className={cn(
        "w-full h-full object-cover transition-opacity",
        (preview.uploading || preview.error) && "opacity-60",
      )}
    />

    {/* Uploading spinner */}
    {preview.uploading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )}

    {/* Success check */}
    {preview.done && (
      <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
        <CheckCircle2 className="w-10 h-10 text-white drop-shadow" />
      </div>
    )}

    {/* Error state */}
    {preview.error && (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/40 gap-2 p-2">
        <AlertCircle className="w-6 h-6 text-white" />
        <p className="text-white text-xs text-center font-medium line-clamp-2">
          {preview.error}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="h-6 text-xs"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    )}

    {/* Remove button (only when not uploading) */}
    {!preview.uploading && !preview.done && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}

    {/* Progress label */}
    {preview.uploading && (
      <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-1">
        Uploading…
      </div>
    )}
  </div>
);
