// types/provider-profile.types.ts

import {
  BaseEntity,
  UserRole,
  SystemRole,
  ServiceStatus,
  SoftDeletable,
  IdDetails,
  ContactDetails,
  UserLocation,
  Coordinates,
  PopulationLevel,
  idType,
} from "../base.types";

// ============================================
// BASE ENTITY INTERFACES
// ============================================

/**
 * File Record Interface (from your file system)
 */
export interface FileRecord extends BaseEntity {
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  label?: string;
  uploadedAt: string;
  isArchived?: boolean;
  archivedAt?: string | null;
}

/**
 * Time Slot Interface
 */
export interface TimeSlot {
  start: string; // Format: "HH:MM" (e.g., "08:00")
  end: string; // Format: "HH:MM" (e.g., "17:00")
}

/**
 * Working Hours Interface
 */
export interface WorkingHours {
  monday?: TimeSlot;
  tuesday?: TimeSlot;
  wednesday?: TimeSlot;
  thursday?: TimeSlot;
  friday?: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
}

/**
 * User Interface (minimal)
 */
export interface User extends BaseEntity {
  email: string;
  isVerified?: boolean;
  systemRole?: SystemRole;
}

/**
 * User Profile Interface (minimal)
 */
export interface UserProfile extends BaseEntity {
  userId: string | User;
  role: UserRole;
  bio?: string;
  mobileNumber: string;
  profilePictureId?: string | FileRecord;
}

/**
 * Category Interface (minimal)
 */
export interface Category extends BaseEntity {
  catName: string;
  slug: string;
  description?: string;
  coverImage?: string | FileRecord;
}

/**
 * Service Pricing Interface
 */
export interface ServicePricing {
  serviceBasePrice: number;
  includeTravelFee?: boolean;
  includeAdditionalFees?: boolean;
  currency: string;
  platformCommissionRate?: number;
  providerEarnings?: number;
}

/**
 * Service Offering Interface
 */
export interface ServiceOffering extends BaseEntity {
  title: string;
  description: string;
  slug: string;
  categoryId: string | Category;
  coverImage?: string | FileRecord;
  servicePricing: ServicePricing;
  isPrivate: boolean;
  isActive: boolean;
  status?: ServiceStatus;
}

// ============================================
// PROVIDER PROFILE INTERFACES
// ============================================

/**
 * Primary Provider Profile Interface
 */
export interface ProviderProfile extends BaseEntity, SoftDeletable {
  // Linking User Profile
  profile: string | UserProfile;

  // Business & Identity Information
  businessName?: string;
  IdDetails?: IdDetails;
  isCompanyTrained: boolean;

  // Service Details
  serviceOfferings?: (string | ServiceOffering)[];
  BusinessGalleryImages?: (string | FileRecord)[];

  // Contact & Location
  providerContactInfo: ContactDetails;
  locationData: UserLocation;

  // Availability & Scheduling
  isAlwaysAvailable: boolean;
  workingHours?: WorkingHours;

  // Payments & Deposits
  requireInitialDeposit: boolean;
  percentageDeposit?: number;
}

/**
 * Populated Provider Profile (for detailed views)
 */
export interface PopulatedProviderProfile
  extends Omit<
    ProviderProfile,
    "profile" | "serviceOfferings" | "BusinessGalleryImages" | "IdDetails"
  > {
  profile: {
    _id: string;
    userId: User;
    role: UserRole;
    bio?: string;
    mobileNumber: string;
    profilePictureId?: FileRecord;
    createdAt: string;
    updatedAt: string;
  };
  serviceOfferings?: ServiceOffering[];
  BusinessGalleryImages?: FileRecord[];
  IdDetails?: {
    idType: idType;
    idNumber: string;
    fileImage: FileRecord[];
  };
}

/**
 * Provider with Distance (for search results)
 */
export interface ProviderWithDistance extends ProviderProfile {
  distance: number;
  distanceUnit: string;
}

/**
 * Provider with Matched Services (for service-specific searches)
 */
export interface ProviderWithMatchedServices extends ProviderProfile {
  distance: number;
  matchedServices: string[];
}

// ============================================
// REQUEST/RESPONSE INTERFACES
// ============================================

/**
 * Create Provider Profile Request Body
 */
export interface CreateProviderProfileRequest {
  // Required fields
  providerContactInfo: ContactDetails;
  locationData: UserLocation;
  isAlwaysAvailable: boolean;
  requireInitialDeposit: boolean;
  isCompanyTrained: boolean;

  // Optional fields
  businessName?: string;
  IdDetails?: IdDetails;
  serviceOfferings?: string[];
  BusinessGalleryImages?: string[];
  workingHours?: WorkingHours;
  percentageDeposit?: number;
}

/**
 * Update Provider Profile Request Body
 */
export interface UpdateProviderProfileRequest {
  businessName?: string;
  IdDetails?: IdDetails;
  isCompanyTrained?: boolean;
  serviceOfferings?: string[];
  BusinessGalleryImages?: string[];
  providerContactInfo?: Partial<ContactDetails>;
  locationData?: Partial<UserLocation>;
  isAlwaysAvailable?: boolean;
  workingHours?: WorkingHours;
  requireInitialDeposit?: boolean;
  percentageDeposit?: number;
}

/**
 * Provider Profile Response
 */
export interface ProviderProfileResponse {
  success?: boolean;
  message: string;
  data?: {
    provider?: ProviderProfile | PopulatedProviderProfile;
    providerProfile?: ProviderProfile | PopulatedProviderProfile;
  };
  error?: string;
}

// ============================================
// SEARCH & FILTER PARAMETERS
// ============================================

/**
 * Search Provider Parameters
 */
export interface ProviderSearchParams
  extends Record<string, string | number | boolean | undefined> {
  // Location filters
  region?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number; // in kilometers

  // Service filters
  serviceId?: string;
  categoryId?: string;

  // Availability filters
  isAlwaysAvailable?: boolean;
  availableNow?: boolean;

  // Business filters
  isCompanyTrained?: boolean;
  requireInitialDeposit?: boolean;

  // Pagination
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Population level
  populate?: PopulationLevel;
}

/**
 * Search Providers Response
 */
export interface SearchProvidersResponse {
  providers: ProviderProfile[] | PopulatedProviderProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Nearest Providers Parameters
 */
export interface NearestProvidersParams {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  serviceId?: string;
  limit?: number;
  populate?: PopulationLevel;
}

/**
 * Nearby Service Providers Parameters
 */
export interface NearbyServiceProvidersParams {
  latitude: number;
  longitude: number;
  serviceIds: string[];
  maxDistance?: number;
  limit?: number;
  populate?: PopulationLevel;
}

/**
 * Get All Providers Parameters (Admin)
 */
export interface GetAllProvidersParams
  extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  region?: string;
  status?: string;
  isCompanyTrained?: boolean;
  populate?: PopulationLevel;
}

/**
 * Get All Providers Response (Admin)
 */
export interface GetAllProvidersResponse {
  providers: ProviderProfile[] | PopulatedProviderProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// LOCATION SERVICES
// ============================================

/**
 * Location Enrichment Request
 */
export interface LocationEnrichmentRequest {
  ghanaPostGPS: string;
  nearbyLandmark?: string;
}

/**
 * Location Verification Request
 */
export interface LocationVerificationRequest {
  latitude: number;
  longitude: number;
}

/**
 * Location Verification Response
 */
export interface LocationVerificationResponse {
  isValid: boolean;
  address?: UserLocation;
}

/**
 * Geocode Request
 */
export interface GeocodeRequest {
  address: string;
  region?: string;
  city?: string;
}

/**
 * Geocode Response
 */
export interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Reverse Geocode Request
 */
export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

/**
 * Nearby Search Request
 */
export interface NearbySearchRequest {
  latitude: number;
  longitude: number;
  radius?: number; // in meters
  type?: string; // e.g., "hospital", "school", "restaurant"
}

/**
 * Nearby Place
 */
export interface NearbyPlace {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distance: number;
}

/**
 * Distance Calculation Request
 */
export interface DistanceCalculationRequest {
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
}

/**
 * Distance Calculation Response
 */
export interface DistanceCalculationResponse {
  distance: number; // in kilometers
  duration?: number; // estimated time in minutes
  unit: "km" | "miles";
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Provider Statistics
 */
export interface ProviderStatistics {
  totalProviders: number;
  activeProviders: number;
  pendingProviders: number;
  suspendedProviders: number;
  companyTrained: number;
  byRegion: Record<string, number>;
  byService: Record<string, number>;
}

/**
 * Service Coverage
 */
export interface ServiceCoverage {
  serviceId: string;
  serviceName: string;
  totalProviders: number;
  coverageByRegion: Array<{
    region: string;
    providerCount: number;
    cities: string[];
  }>;
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Bulk Operations Request
 */
export interface BulkOperationsRequest {
  providerIds: string[];
  operation: "approve" | "reject" | "suspend" | "unsuspend" | "delete";
  reason?: string;
}

/**
 * Bulk Operations Response
 */
export interface BulkOperationsResponse {
  success: boolean;
  processed: number;
  failed: number;
  results: Array<{
    providerId: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Provider Report Parameters
 */
export interface ProviderReportParams
  extends Record<string, string | number | boolean | undefined> {
  startDate?: string;
  endDate?: string;
  region?: string;
  serviceId?: string;
  format?: "json" | "csv" | "pdf";
}

/**
 * Get Audit Log Parameters
 */
export interface GetAuditLogParams
  extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * Audit Log Response
 */
export interface AuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version?: string;
}

// ============================================
// FORM STATE & UI HELPERS
// ============================================

/**
 * Provider Profile Form Data (for create/update forms)
 */
export interface ProviderProfileFormData {
  // Business Info
  businessName: string;
  isCompanyTrained: boolean;

  // Contact Info
  primaryContact: string;
  secondaryContact: string;
  businessContact: string;
  businessEmail: string;

  // Location Info
  ghanaPostGPS: string;
  nearbyLandmark: string;
  region: string;
  city: string;
  district: string;
  locality: string;

  // ID Details
  idType: idType;
  idNumber: string;
  idImages: File[];

  // Gallery Images
  galleryImages: File[];

  // Availability
  isAlwaysAvailable: boolean;
  workingHours: WorkingHours;

  // Payment
  requireInitialDeposit: boolean;
  percentageDeposit: number;

  // Services
  selectedServices: string[];
}

/**
 * Provider Profile Form Errors
 */
export interface ProviderProfileFormErrors {
  businessName?: string;
  primaryContact?: string;
  secondaryContact?: string;
  businessContact?: string;
  businessEmail?: string;
  ghanaPostGPS?: string;
  nearbyLandmark?: string;
  region?: string;
  city?: string;
  idType?: string;
  idNumber?: string;
  idImages?: string;
  galleryImages?: string;
  workingHours?: string;
  percentageDeposit?: string;
  selectedServices?: string;
  general?: string;
}

/**
 * Provider Filter State (for search/filter UI)
 */
export interface ProviderFilterState {
  region: string;
  city: string;
  serviceId: string;
  categoryId: string;
  isCompanyTrained: boolean | null;
  isAlwaysAvailable: boolean | null;
  requireInitialDeposit: boolean | null;
  maxDistance: number | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

/**
 * Location Search State (for map/location UI)
 */
export interface LocationSearchState {
  currentLocation: Coordinates | null;
  searchRadius: number;
  selectedRegion: string;
  selectedCity: string;
  availableRegions: string[];
  availableCities: string[];
  nearbyProviders: ProviderWithDistance[];
  isLoadingLocation: boolean;
  locationError: string | null;
}

/**
 * Provider Profile UI State
 */
export interface ProviderProfileUIState {
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
  currentProvider: PopulatedProviderProfile | null;
  providers: ProviderProfile[];
  totalProviders: number;
  currentPage: number;
  totalPages: number;
}

