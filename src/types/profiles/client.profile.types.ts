// ============================================================================
// BASE TYPE DEFINITIONS (from backend)
// ============================================================================

import { idType, UserRole } from "../base.types";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation {
  // Core (User-provided)
  ghanaPostGPS: string;
  nearbyLandmark?: string;

  // Auto-filled / Verified
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

// types/ui/id-details.ui.ts
export interface IdImageUI {
  _id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

export interface IdDetails {
  idType: string;
  idNumber: string;
  fileImage?: IdImageUI[];
}

export interface ClientContactDetails {
  secondaryContact?: string;
  emailAddress?: string;
}

// ============================================================================
// CLIENT PROFILE TYPES
// ============================================================================

export interface SavedPaymentMethod {
  _id?: string;
  type: "mobile_money" | "card" | "bank_account";
  provider?: string;
  isDefault: boolean;
  label?: string;
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export interface ClientPreferences {
  preferredCategories?: string[];
  communicationPreferences?: CommunicationPreferences;
  languagePreference?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface VerificationDetails {
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean;
  verifiedAt?: Date;
}

export interface ClientProfile {
  _id: string;
  profile: {
    _id: string;
    userId: {
      _id: string;
      email: string;
      createdAt: string;
    };
    role: UserRole;
    bio?: string;
    mobileNumber?: string;
    profilePictureId?: {
      _id: string;
      url: string;
      thumbnailUrl: string;
      fileName: string;
      uploadedAt: string;
    };
    createdAt: string;
    updatedAt: string;
  };

  // Personal Information
  preferredName?: string;
  dateOfBirth?: Date | string;
  idDetails?: IdDetails;

  // Contact & Location
  clientContactInfo?: ClientContactDetails;
  savedAddresses?: UserLocation[];
  defaultAddressIndex?: number;

  // Preferences & Settings
  preferences?: ClientPreferences;

  // Service History & Favorites
  favoriteServices?: any[];
  favoriteProviders?: any[];
  serviceHistory?: string[];

  // Payment Information
  savedPaymentMethods?: SavedPaymentMethod[];

  // Trust & Safety
  isVerified: boolean;
  verificationDetails?: VerificationDetails;

  // Emergency Contact
  emergencyContact?: EmergencyContact;

  // Soft Delete
  isDeleted?: boolean;
  deletedAt?: Date | string | null;
  deletedBy?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CompleteClientProfile {
  client: ClientProfile;
  stats?: ClientStats;
  defaultAddress?: UserLocation;
  defaultPaymentMethod?: SavedPaymentMethod | null;
}

export interface ClientStats {
  totalBookings: number;
  totalFavoriteServices: number;
  totalFavoriteProviders: number;
  totalSavedAddresses: number;
  totalPaymentMethods: number;
  verificationStatus: VerificationStatus;
}

export interface VerificationStatus {
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean;
  overallVerified: boolean;
  verifiedAt?: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateClientProfileRequest {
  preferredName?: string;
  dateOfBirth?: Date;
  clientContactInfo?: ClientContactDetails;
  savedAddresses?: UserLocation[];
  preferences?: {
    preferredCategories?: string[];
    communicationPreferences?: Partial<CommunicationPreferences>;
    languagePreference?: string;
  };
  emergencyContact?: EmergencyContact;
}

export interface UpdateClientProfileRequest {
  preferredName?: string;
  dateOfBirth?: Date;
  clientContactInfo?: ClientContactDetails;
  preferences?: Partial<ClientPreferences>;
  emergencyContact?: EmergencyContact;
}

export interface UpdateIdDetailsRequest {
  idType: idType;
  idNumber: string;
}

export interface ManageFavoritesRequest {
  serviceId?: string;
  providerId?: string;
  action: "add" | "remove";
}

export interface ManageAddressRequest {
  address?: UserLocation;
  addressIndex?: number;
  action: "add" | "remove" | "set_default";
}

export interface AddPaymentMethodRequest {
  type: "mobile_money" | "card" | "bank_account";
  provider?: string;
  isDefault: boolean;
  label?: string;
}

export interface UpdateCommunicationPreferencesRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface UpdateEmergencyContactRequest {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface UpdatePreferredCategoriesRequest {
  preferredCategories: string[];
}

export interface UpdateLanguagePreferenceRequest {
  languagePreference: string;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface SearchClientsParams {
  query?: string;
  region?: string;
  city?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface FindNearestClientsRequest {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  limit?: number;
}

export interface FindClientsByLocationParams {
  region: string;
  city?: string;
  limit?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// LOCATION UTILITY TYPES
// ============================================================================

export interface EnrichLocationRequest {
  ghanaPostGPS: string;
}

export interface EnrichLocationResponse extends UserLocation {}

export interface VerifyLocationRequest {
  latitude: number;
  longitude: number;
  ghanaPostGPS?: string;
}

export interface VerifyLocationResponse {
  isValid: boolean;
  distance?: number;
  matchedAddress?: string;
}

export interface GeocodeAddressRequest {
  address: string;
  region?: string;
  city?: string;
}

export interface GeocodeAddressResponse {
  coordinates: Coordinates;
  formattedAddress: string;
}

export interface CalculateDistanceRequest {
  from: Coordinates;
  to: Coordinates;
}

export interface CalculateDistanceResponse {
  distance: number;
  unit: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StatisticsResponse {
  totalClients: number;
  verifiedClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientsByRegion: Record<string, number>;
}

export interface RegionData {
  region: string;
  clientCount: number;
  cities: string[];
}

export interface ClientProfileResponse {
  message: string;
  clientProfile?: ClientProfile;
  error?: string;
}

export interface ClientProfileDetailedResponse {
  message: string;
  clientProfile?: ClientProfile;
  favoriteServicesCount?: number;
  favoriteProvidersCount?: number;
  totalBookings?: number;
  verificationStatus?: VerificationStatus;
  error?: string;
}

export interface NearestClientResult extends ClientProfile {
  distance: number;
}

