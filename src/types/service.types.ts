// api/services/service.types.ts

import { User } from "./user.types";

export enum PopulationLevel {
  NONE = "none",
  MINIMAL = "minimal",
  STANDARD = "standard",
  DETAILED = "detailed",
  COMPLETE = "complete",
}

export enum ProviderAccessLevel {
  STANDARD = "standard",
  VERIFIED = "verified",
  COMPANY_TRAINED = "company_trained",
  ADMIN = "admin",
}

export interface ServiceCategory {
  _id: string;
  catName: string;
  slug: string;
}

export interface ServiceImage {
  _id: string;
  url: string;
  fileName: string;
  label: string;
  thumbnailUrl?: string;
  uploadedAt?: string;
}

export interface ServicePricing {
  serviceBasePrice: number;
  includeTravelFee: boolean;
  includeAdditionalFees: boolean;
  currency: string;
  platformCommissionRate: number;
  providerEarnings: number;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  categoryId: string | ServiceCategory;
  coverImage?: string | ServiceImage;
  providerId?: string;
  servicePricing?: ServicePricing;
  isPrivate: boolean;
  submittedBy?: User;
  approvedBy?: User;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  __v?: number;
}

export interface CreateServiceDTO {
  title: string;
  description: string;
  tags?: string[];
  categoryId: string;
  coverImage?: string;
  providerId?: string;
  servicePricing?: {
    serviceBasePrice: number;
    includeTravelFee?: boolean;
    includeAdditionalFees?: boolean;
    currency?: string;
    platformCommissionRate?: number;
  };
  isPrivate?: boolean;
}

export interface UpdateServiceDTO {
  title?: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
  coverImage?: string;
  servicePricing?: {
    serviceBasePrice?: number;
    includeTravelFee?: boolean;
    includeAdditionalFees?: boolean;
    currency?: string;
    platformCommissionRate?: number;
  };
  isPrivate?: boolean;
}

export interface ServiceSearchFilters {
  categoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isActive?: boolean;
  isPrivate?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ServiceQueryResult {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CompleteServiceResult {
  service: Service;
  coverImage?: ServiceImage;
}

export interface ServiceStats {
  total: number;
  active: number;
  pending: number;
  rejected: number;
  private: number;
  public: number;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ServiceAccessibilityResponse {
  accessible: boolean;
}

export interface BulkUpdateResponse {
  modifiedCount: number;
}
