// types/provider.types.ts

import { Service } from "./service.types";

/**
 * Provider Status
 */
export type ProviderStatus = "active" | "inactive" | "suspended" | "pending";

/**
 * Verification Status
 */
export type VerificationStatus = "verified" | "unverified" | "in_review";

/**
 * Provider Location
 */
export interface ProviderLocation {
  address: string;
  city: string;
  region: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  postalCode?: string;
}

/**
 * Provider Availability
 */
export interface ProviderAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

/**
 * Provider Rating & Reviews
 */
export interface ProviderRating {
  overall: number; // Average rating
  communication: number;
  quality: number;
  punctuality: number;
  professionalism: number;
  totalReviews: number;
}

/**
 * Provider Service Offering
 */
export interface ProviderServiceOffering {
  serviceId: string;
  service?: Service;
  customPrice?: number; // Provider's custom price for this service
  isAvailable: boolean;
  responseTime: string; // e.g., "30 mins", "1 hour"
  description?: string; // Provider's custom description for this service
  experience?: string; // Years of experience with this service
}

/**
 * Provider Certification
 */
export interface ProviderCertification {
  _id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl?: string;
  verified: boolean;
}

/**
 * Provider Statistics
 */
export interface ProviderStats {
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageResponseTime: string;
  completionRate: number; // Percentage
  repeatClientRate: number; // Percentage
  onTimeRate: number; // Percentage
}

/**
 * Provider Social Links
 */
export interface ProviderSocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

/**
 * Provider Main Interface
 */
export interface Provider {
  _id: string;
  userId: string; // Reference to User
  businessName?: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: {
    _id: string;
    url: string;
    thumbnailUrl: string;
    fileName: string;
  };
  coverImage?: {
    _id: string;
    url: string;
    fileName: string;
  };
  bio?: string;
  tagline?: string;
  location: ProviderLocation;
  services: ProviderServiceOffering[];
  categories: string[]; // Category IDs
  rating: ProviderRating;
  stats: ProviderStats;
  certifications?: ProviderCertification[];
  availability?: ProviderAvailability;
  status: ProviderStatus;
  verificationStatus: VerificationStatus;
  verified: boolean;
  verifiedAt?: string;
  socialLinks?: ProviderSocialLinks;
  joinedAt: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * Simplified Provider (for lists/cards)
 */
export interface ProviderPreview {
  _id: string;
  displayName: string;
  businessName?: string;
  avatar?: string;
  location: string;
  distance?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  price: number;
  responseTime: string;
  completedJobs: number;
  verificationStatus: VerificationStatus;
}

/**
 * Provider Filters
 */
export interface ProviderFilters {
  page?: number;
  limit?: number;
  serviceId?: string;
  categoryId?: string;
  location?: string;
  maxDistance?: number; // in km
  minRating?: number;
  verified?: boolean;
  status?: ProviderStatus;
  sortBy?: "distance" | "rating" | "price" | "completedJobs" | "responseTime";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Paginated Provider Response
 */
export interface PaginatedProvidersResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Provider by Service Response
 */
export interface ProvidersByServiceResponse {
  providers: ProviderPreview[];
  service: Service;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create Provider Data
 */
export interface CreateProviderData {
  businessName?: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio?: string;
  tagline?: string;
  location: ProviderLocation;
  services: Array<{
    serviceId: string;
    customPrice?: number;
    description?: string;
  }>;
  categories: string[];
  availability?: ProviderAvailability;
  socialLinks?: ProviderSocialLinks;
}

/**
 * Update Provider Data
 */
export interface UpdateProviderData {
  businessName?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  tagline?: string;
  location?: ProviderLocation;
  services?: Array<{
    serviceId: string;
    customPrice?: number;
    isAvailable?: boolean;
    description?: string;
  }>;
  categories?: string[];
  availability?: ProviderAvailability;
  socialLinks?: ProviderSocialLinks;
  status?: ProviderStatus;
}

/**
 * Provider Verification Data
 */
export interface ProviderVerificationData {
  documents: Array<{
    type: "id" | "license" | "certificate" | "business_registration";
    url: string;
    name: string;
  }>;
  additionalInfo?: string;
}

/**
 * Provider Review
 */
export interface ProviderReview {
  _id: string;
  providerId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  serviceId: string;
  serviceName: string;
  rating: {
    overall: number;
    communication: number;
    quality: number;
    punctuality: number;
    professionalism: number;
  };
  comment: string;
  images?: string[];
  response?: {
    text: string;
    respondedAt: string;
  };
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Provider Analytics
 */
export interface ProviderAnalytics {
  views: {
    total: number;
    trend: number; // Percentage change
    byPeriod: Array<{ date: string; count: number }>;
  };
  requests: {
    total: number;
    accepted: number;
    declined: number;
    pending: number;
    trend: number;
  };
  revenue: {
    total: number;
    trend: number;
    byPeriod: Array<{ date: string; amount: number }>;
  };
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    requestCount: number;
    revenue: number;
  }>;
}