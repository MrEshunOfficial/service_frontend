// types/service.types.ts
// Frontend mirror of the backend Service type.
// IDs are serialized as strings (JSON), dates as ISO strings.

// ── Populated sub-shapes (returned when population is applied) ────────────────

export interface PopulatedCategory {
  _id: string;
  catName: string;
  catDesc?: string;
  slug: string;
  isActive?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface PopulatedFile {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  label?: string;
  uploadedAt?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface PopulatedProvider {
  _id: string;
  businessName?: string;
  slug?: string;
  business_logo?: string;
  location?: string;
  providerContactInfo?: {
    primaryContact: string;
    businessContact?: string;
    businessEmail?: string;
  };
  createdAt?: string;
}

export interface PopulatedUser {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
}

// ── Service pricing ───────────────────────────────────────────────────────────

export interface ServicePricing {
  serviceBasePrice: number;
  includeTravelFee: boolean;
  includeAdditionalFees: boolean;
  currency: string;
  platformCommissionRate: number;
  providerEarnings: number; // auto-calculated server-side
}

// ── Core Service type ─────────────────────────────────────────────────────────

export interface Service {
  _id: string;
  id?: string; // virtual alias for _id

  // Core fields
  title: string;
  description: string;
  slug: string;
  tags: string[];

  // Populated or plain ID references
  categoryId: string | PopulatedCategory;
  coverImage?: string | PopulatedFile;

  /**
   * A service belongs to at most ONE provider.
   *
   * This is a scalar reference — NOT an array.
   * Optional: admin-created catalog services may have no provider.
   *
   * Depending on population level this will be either a plain string ID
   * or a populated ProviderProfile object.
   */
  providerId?: string | PopulatedProvider;

  // Pricing
  servicePricing?: ServicePricing;

  isPrivate: boolean;

  // Moderation
  submittedBy?: string | PopulatedUser;
  approvedBy?: string | PopulatedUser;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isActive?: boolean;

  // Soft delete
  deletedAt?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Server-side virtuals (present in toJSON/toObject output)
  isApproved?: boolean;
  isRejected?: boolean;
  isPending?: boolean;
}

// ── Narrow helpers ────────────────────────────────────────────────────────────

/** Narrows categoryId to populated shape */
export function isPopulatedCategory(
  v: string | PopulatedCategory
): v is PopulatedCategory {
  return typeof v === "object" && v !== null;
}

/** Narrows coverImage to populated shape */
export function isPopulatedFile(
  v: string | PopulatedFile | undefined
): v is PopulatedFile {
  return typeof v === "object" && v !== null;
}

/** Narrows providerId to populated shape */
export function isPopulatedProvider(
  v: string | PopulatedProvider | undefined
): v is PopulatedProvider {
  return typeof v === "object" && v !== null;
}