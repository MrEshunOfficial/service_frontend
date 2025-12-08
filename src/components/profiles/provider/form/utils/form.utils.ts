// ============================================
// FILE 1: utils/form-transformers.ts (NEW FILE)
// ============================================

import { FileReference } from "@/types/base.types";

/**
 * Convert FileReference(s) to string array of IDs
 * Handles: FileReference, FileReference[], string, string[], undefined
 */
export function transformFileReferenceToIds(
  fileRef: FileReference | FileReference[] | string | string[] | undefined
): string[] {
  if (!fileRef) return [];

  // Handle array of FileReferences or strings
  if (Array.isArray(fileRef)) {
    return fileRef
      .map((f) => {
        if (typeof f === "string") return f;
        return f._id || f.fileId || f.url || "";
      })
      .filter(Boolean);
  }

  // Handle single string
  if (typeof fileRef === "string") return [fileRef];

  // Handle single FileReference object
  const id = fileRef._id || fileRef.fileId || fileRef.url || "";
  return id ? [id] : [];
}

/**
 * Convert string array to FileReference array for API
 */
export function transformIdsToFileReference(ids: string[]): FileReference[] {
  return ids.map((id) => ({
    _id: id,
    fileId: id,
    url: "",
    fileName: "",
  }));
}
