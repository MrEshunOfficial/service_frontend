import { UserProfile } from "@/types/profile.types";
import {
  ContactDetails,
  FileReference,
  UserLocation,
} from "./base.types";
import { Service } from "./service.types";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
  };
}

export interface ProviderProfile {
  _id: string;
  profile: UserProfile;
  businessName?: string;
  IdDetails?: {
    idType: string;
    idNumber: string;
    idFile: FileReference[];
  };
  isCompanyTrained: boolean;
  serviceOfferings?: Service[];
  BusinessGalleryImages?: FileReference[];
  providerContactInfo: ContactDetails;
  locationData: UserLocation;
  isAlwaysAvailable: boolean;
  workingHours?: WorkingHours;
  requireInitialDeposit: boolean;
  percentageDeposit?: number;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderProfileRequest {
  businessName?: string;
  isCompanyTrained?: boolean;
  serviceOfferings: string[];
  providerContactInfo: ContactDetails;
  locationData: UserLocation;
  isAlwaysAvailable?: boolean;
  workingHours?: WorkingHours;
  requireInitialDeposit?: boolean;
  percentageDeposit?: number;
}

export interface UpdateProviderProfileRequest {
  businessName?: string;
  isCompanyTrained?: boolean;
  serviceOfferings?: string[];
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
  isCompanyTrained: boolean;
  requireInitialDeposit: boolean;
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
