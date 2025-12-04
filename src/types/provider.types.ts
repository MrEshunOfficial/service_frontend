
import { UserProfile } from "@/types/profile.types";

// ============================================
// Shared Type Definitions
// ============================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation {
  // Core (User-provided)
  ghanaPostGPS: string;
  nearbyLandmark?: string;

  // Auto-filled / Verified (from OpenStreetMap or Google Map)
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
  streetName?: string;
  houseNumber?: string;

  // Technical / Validation
  gpsCoordinates?: Coordinates;
  isAddressVerified?: boolean;
  sourceProvider?: "openstreetmap" | "google" | "ghanapost";

  // System Fields
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactDetails {
  // Personal
  primaryContact: string;
  secondaryContact?: string;

  // Business
  businessContact?: string;
  businessEmail?: string;
}

export enum IdType {
  NATIONAL_ID = "national_id",
  PASSPORT = "passport",
  VOTERS_ID = "voters_id",
  DRIVERS_LICENSE = "drivers_license",
  NHIS = "nhis",
  OTHER = "other",
}

export interface IdDetails {
  idType: IdType;
  idNumber: string;
  fileImage: string[]; // Array of file/image IDs
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
  };
}

// ============================================
// Provider Profile Types
// ============================================

export interface ProviderProfile {
  _id: string;
  profile: UserProfile; // User profile ID reference
  
  // Business & Identity Information
  businessName?: string;
  IdDetails?: IdDetails;
  isCompanyTrained: boolean;

  // Service Details
  serviceOfferings?: string[]; // Array of service IDs
  BusinessGalleryImages?: string[]; // Array of image IDs

  // Contact & Location
  providerContactInfo: ContactDetails;
  locationData: UserLocation;

  // Availability & Scheduling
  isAlwaysAvailable: boolean;
  workingHours?: WorkingHours;

  // Payments & Deposits
  requireInitialDeposit: boolean;
  percentageDeposit?: number;

  // Soft Delete
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderProfileRequest {
  businessName?: string;
  IdDetails?: IdDetails;
  isCompanyTrained?: boolean;
  serviceOfferings?: string[];
  BusinessGalleryImages?: string[];
  providerContactInfo: ContactDetails;
  locationData: UserLocation;
  isAlwaysAvailable?: boolean;
  workingHours?: WorkingHours;
  requireInitialDeposit?: boolean;
  percentageDeposit?: number;
}

export interface UpdateProviderProfileRequest {
  businessName?: string;
  IdDetails?: IdDetails;
  isCompanyTrained?: boolean;
  serviceOfferings?: string[];
  BusinessGalleryImages?: string[];
  providerContactInfo?: ContactDetails;
  locationData?: UserLocation;
  isAlwaysAvailable?: boolean;
  workingHours?: WorkingHours;
  requireInitialDeposit?: boolean;
  percentageDeposit?: number;
}

export interface NearestProviderResult {
  provider: ProviderProfile;
  distanceKm: number;
  distanceFormatted: string;
}

export interface FindNearestProvidersRequest {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  limit?: number;
  serviceId?: string;
}

export interface FindProvidersByLocationParams {
  region: string;
  city?: string;
  serviceId?: string;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface DistanceResult {
  distanceKm: number;
  distanceFormatted: string;
}

export interface SearchProvidersRequest {
  searchTerm?: string;
  region?: string;
  city?: string;
  serviceIds?: string[];
  isCompanyTrained?: boolean;
  requireInitialDeposit?: boolean;
  userLocation?: Coordinates;
  maxDistance?: number;
  limit?: number;
  skip?: number;
}

export interface SearchProvidersResponse {
  providers: ProviderProfile[];
  total: number;
  count: number;
}

export interface AddServiceRequest {
  serviceId: string;
}

// ============================================
// Location Types
// ============================================

export interface EnrichLocationRequest {
  ghanaPostGPS: string;
  coordinates?: Coordinates;
  nearbyLandmark?: string;
}

export interface VerifyLocationRequest {
  ghanaPostGPS: string;
  coordinates: Coordinates;
}

export interface VerifyLocationResponse {
  verified: boolean;
  confidence: number;
  actualLocation?: string;
  distanceKm?: number;
  message: string;
}

export interface GeocodeRequest {
  address: string;
}

export interface GeocodeResponse {
  coordinates: Coordinates;
  displayName: string;
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResponse {
  location: UserLocation;
  coordinates: Coordinates;
  displayName?: string;
}

export interface SearchNearbyRequest {
  latitude: number;
  longitude: number;
  query: string;
  radiusKm?: number;
}

export interface GeocodingResult {
  displayName: string;
  coordinates: Coordinates;
  type?: string;
  importance?: number;
  osmType?: string;
  osmId?: number;
}

export interface CalculateDistanceRequest {
  from: Coordinates;
  to: Coordinates;
}

export interface CalculateDistanceResponse {
  distanceKm: number;
  distanceFormatted: string;
  from: Coordinates;
  to: Coordinates;
}

export interface BatchGeocodeRequest {
  addresses: string[];
}

export interface BatchGeocodeResponse {
  [address: string]: {
    success: boolean;
    coordinates?: Coordinates;
    displayName?: string;
    error?: string;
  };
}

export interface PlaceDetailsResponse {
  location: UserLocation;
  coordinates: Coordinates;
  rawResponse?: any;
}