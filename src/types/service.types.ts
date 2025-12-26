// types/service.types.ts (Frontend version)

import { Category } from "./category.types";

export interface Service {
  _id: string;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  categoryId: Category;
  coverImage?: {
    _id: string;
    thumbnailUrl: string;
    url: string;
    fileName: string;
  };
  providerId?: string;
  servicePricing?: ServicePricing;
  isPrivate: boolean;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ServicePricing {
  serviceBasePrice: number;
  includeTravelFee: boolean;
  includeAdditionalFees: boolean;
  currency: string;
  platformCommissionRate: number;
  providerEarnings: number;
}

