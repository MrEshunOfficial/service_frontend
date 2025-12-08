// api/providers/unified-provider-api.client.ts

import { Service } from "@/types/service.types";
import { APIClient } from "../base/api-client";
import {
  Coordinates,
  UserLocation,
  ContactDetails,
  IdDetails,
  idType,
} from "@/types/base.types";
import {
  CreateProviderProfileRequest,
  ProviderProfile,
  UpdateProviderProfileRequest,
  FindNearestProvidersRequest,
  NearestProviderResult,
  FindProvidersByLocationParams,
  DistanceResult,
  SearchProvidersRequest,
  SearchProvidersResponse,
  AddServiceRequest,
  EnrichLocationRequest,
  VerifyLocationRequest,
  VerifyLocationResponse,
  BatchGeocodeRequest,
  BatchGeocodeResponse,
  GeocodeRequest,
  GeocodeResponse,
  ReverseGeocodeRequest,
  ReverseGeocodeResponse,
  SearchNearbyRequest,
  GeocodingResult,
  CalculateDistanceRequest,
  CalculateDistanceResponse,
  PlaceDetailsResponse,
  WorkingHours,
} from "@/types/provider.types";

// ============================================
// Unified Provider & Location API Client
// ============================================

export class UnifiedProviderAPIClient extends APIClient {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ============================================
  // PROVIDER PROFILE - CRUD Operations
  // ============================================

  /**
   * Create a new provider profile
   * @param request - Provider profile data
   * @returns Created provider profile
   */
  async createProviderProfile(
    request: CreateProviderProfileRequest
  ): Promise<ProviderProfile> {
    return this.post<ProviderProfile>("/api/provider-profiles", request);
  }

  /**
   * Update provider profile
   * @param providerId - Provider ID
   * @param request - Updated provider data
   * @returns Updated provider profile
   */
  async updateProviderProfile(
    providerId: string,
    request: UpdateProviderProfileRequest
  ): Promise<ProviderProfile> {
    return this.put<ProviderProfile>(
      `/api/provider-profiles/${providerId}`,
      request
    );
  }

  /**
   * Soft delete provider profile
   * @param providerId - Provider ID
   * @returns Success message
   */
  async deleteProviderProfile(
    providerId: string
  ): Promise<{ message: string }> {
    return this.delete<{ message: string }>(
      `/api/provider-profiles/${providerId}`
    );
  }

  /**
   * Restore soft-deleted provider profile
   * @param providerId - Provider ID
   * @returns Success message
   */
  async restoreProviderProfile(
    providerId: string
  ): Promise<{ message: string }> {
    return this.post<{ message: string }>(
      `/api/provider-profiles/${providerId}/restore`
    );
  }

  /**
   * Get current user's provider profile
   * @returns Current user's provider profile
   */
  async getMyProviderProfile(): Promise<ProviderProfile> {
    return this.get<ProviderProfile>("/api/provider-profiles/me");
  }

  // ============================================
  // PROVIDER PROFILE - Public Retrieval
  // ============================================

  /**
   * Get provider profile by ID
   * Public - for browsing
   * @param providerId - Provider ID
   * @returns Provider profile
   */
  async getProviderProfile(providerId: string): Promise<ProviderProfile> {
    return this.get<ProviderProfile>(`/api/provider-profiles/${providerId}`);
  }

  /**
   * Get provider profile by user profile ID
   * Public - for browsing
   * @param profileId - User profile ID
   * @returns Provider profile
   */
  async getProviderByProfile(profileId: string): Promise<ProviderProfile> {
    return this.get<ProviderProfile>(
      `/api/provider-profiles/by-profile/${profileId}`
    );
  }

  // ============================================
  // PROVIDER PROFILE - Location-Based Operations
  // ============================================

  /**
   * Find nearest providers to a location
   * Public - for browsing and discovery
   * @param request - Search parameters with coordinates
   * @returns Array of nearest providers with distances
   */
  async findNearestProviders(
    request: FindNearestProvidersRequest
  ): Promise<NearestProviderResult[]> {
    return this.post<NearestProviderResult[]>(
      "/api/provider-profiles/nearest",
      request
    );
  }

  /**
   * Find providers by region and city
   * Public - for browsing
   * @param params - Region, city, and optional filters
   * @returns Array of provider profiles
   */
  async findProvidersByLocation(
    params: FindProvidersByLocationParams
  ): Promise<ProviderProfile[]> {
    return this.get<ProviderProfile[]>(
      "/api/provider-profiles/by-location",
      params
    );
  }

  /**
   * Calculate distance from user to provider
   * Public - for browsing
   * @param providerId - Provider ID
   * @param userLocation - User's coordinates
   * @returns Distance information
   */
  async getDistanceToProvider(
    providerId: string,
    userLocation: Coordinates
  ): Promise<DistanceResult> {
    return this.post<DistanceResult>(
      `/api/provider-profiles/${providerId}/distance`,
      userLocation
    );
  }

  /**
   * Advanced search for providers with multiple filters
   * Public - for browsing and discovery
   * @param request - Search parameters and filters
   * @returns Search results with total count
   */
  async searchProviders(
    request: SearchProvidersRequest
  ): Promise<SearchProvidersResponse> {
    return this.post<SearchProvidersResponse>(
      "/api/provider-profiles/search",
      request
    );
  }

  // ============================================
  // PROVIDER PROFILE - Service Management
  // ============================================

  /**
   * Add a service to provider's offerings
   * @param providerId - Provider ID
   * @param request - Service ID to add
   * @returns Updated provider profile
   */
  async addServiceToProvider(
    providerId: string,
    request: AddServiceRequest
  ): Promise<ProviderProfile> {
    return this.post<ProviderProfile>(
      `/api/provider-profiles/${providerId}/services`,
      request
    );
  }

  /**
   * Remove a service from provider's offerings
   * @param providerId - Provider ID
   * @param serviceId - Service ID to remove
   * @returns Updated provider profile
   */
  async removeServiceFromProvider(
    providerId: string,
    serviceId: string
  ): Promise<ProviderProfile> {
    return this.delete<ProviderProfile>(
      `/api/provider-profiles/${providerId}/services/${serviceId}`
    );
  }

  /**
   * Get available private services for company-trained providers
   * @param providerId - Provider ID
   * @returns Array of available private services
   */
  async getAvailablePrivateServices(providerId: string): Promise<Service[]> {
    return this.get<Service[]>(
      `/api/provider-profiles/${providerId}/available-private-services`
    );
  }

  // ============================================
  // LOCATION - Private Operations
  // ============================================

  /**
   * Enrich location data with OpenStreetMap details
   * Used during profile creation/update to add rich location information
   * @param request - Ghana Post GPS and optional coordinates/landmark
   * @returns Enriched location data
   */
  async enrichLocationData(
    request: EnrichLocationRequest
  ): Promise<UserLocation> {
    return this.post<UserLocation>(
      "/api/provider-profiles/location/enrich",
      request
    );
  }

  /**
   * Verify if coordinates match Ghana Post GPS address
   * Used for location verification during profile setup
   * @param request - Ghana Post GPS and coordinates to verify
   * @returns Verification result with confidence score
   */
  async verifyLocation(
    request: VerifyLocationRequest
  ): Promise<VerifyLocationResponse> {
    return this.post<VerifyLocationResponse>(
      "/api/provider-profiles/location/verify",
      request
    );
  }

  /**
   * Geocode multiple addresses at once (max 20)
   * Used for bulk operations or admin tasks
   * @param request - Array of addresses to geocode
   * @returns Map of addresses to their geocoding results
   */
  async batchGeocode(
    request: BatchGeocodeRequest
  ): Promise<BatchGeocodeResponse> {
    return this.post<BatchGeocodeResponse>(
      "/api/provider-profiles/location/batch-geocode",
      request
    );
  }

  // ============================================
  // LOCATION - Public Operations
  // ============================================

  /**
   * Convert address to coordinates (forward geocoding)
   * Public - used for map browsing and search
   * @param request - Address to geocode
   * @returns Coordinates and display name
   */
  async geocodeAddress(request: GeocodeRequest): Promise<GeocodeResponse> {
    return this.post<GeocodeResponse>(
      "/api/provider-profiles/location/geocode",
      request
    );
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   * Public - used for map browsing and location selection
   * @param request - Coordinates to reverse geocode
   * @returns Location details and formatted address
   */
  async reverseGeocode(
    request: ReverseGeocodeRequest
  ): Promise<ReverseGeocodeResponse> {
    return this.post<ReverseGeocodeResponse>(
      "/api/provider-profiles/location/reverse-geocode",
      request
    );
  }

  /**
   * Search for nearby places (POIs, landmarks, etc.)
   * Public - used for discovery and location search
   * @param request - Search query and center coordinates
   * @returns Array of nearby places
   */
  async searchNearby(request: SearchNearbyRequest): Promise<GeocodingResult[]> {
    return this.post<GeocodingResult[]>(
      "/api/provider-profiles/location/search-nearby",
      request
    );
  }

  /**
   * Calculate distance between two coordinates
   * Public utility - used for distance calculations
   * @param request - From and to coordinates
   * @returns Distance in km and formatted string
   */
  async calculateDistance(
    request: CalculateDistanceRequest
  ): Promise<CalculateDistanceResponse> {
    return this.post<CalculateDistanceResponse>(
      "/api/provider-profiles/location/calculate-distance",
      request
    );
  }

  /**
   * Get place details by OpenStreetMap ID
   * Public - used for place discovery and details
   * @param osmType - 'N' (Node), 'W' (Way), or 'R' (Relation)
   * @param osmId - OpenStreetMap ID
   * @returns Place details including location and coordinates
   */
  async getPlaceDetails(
    osmType: "N" | "W" | "R",
    osmId: number
  ): Promise<PlaceDetailsResponse> {
    return this.get<PlaceDetailsResponse>(
      `/api/provider-profiles/location/place/${osmType}/${osmId}`
    );
  }

  // ============================================
  // PROVIDER UTILITIES
  // ============================================

  /**
   * Check if user has a provider profile
   * @returns True if profile exists
   */
  async hasProviderProfile(): Promise<boolean> {
    try {
      await this.getMyProviderProfile();
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get providers near current location
   * Convenience method combining getCurrentLocation with findNearestProviders
   * @param options - Search options
   * @returns Nearest providers
   */
  async findProvidersNearMe(
    options?: Omit<FindNearestProvidersRequest, "latitude" | "longitude">
  ): Promise<NearestProviderResult[]> {
    const location = await this.getCurrentLocation();
    return this.findNearestProviders({
      latitude: location.latitude,
      longitude: location.longitude,
      ...options,
    });
  }

  /**
   * Search providers with current location
   * Convenience method for location-aware search
   * @param request - Search parameters (userLocation will be auto-added)
   * @returns Search results
   */
  async searchProvidersNearMe(
    request: Omit<SearchProvidersRequest, "userLocation">
  ): Promise<SearchProvidersResponse> {
    const userLocation = await this.getCurrentLocation();
    return this.searchProviders({
      ...request,
      userLocation,
    });
  }

  /**
   * Check if provider is currently available (not deleted)
   * @param provider - Provider profile
   * @returns True if available
   */
  isProviderActive(provider: ProviderProfile): boolean {
    return !provider.isDeleted;
  }

  /**
   * Check if provider is always available or currently within working hours
   * @param provider - Provider profile
   * @returns True if available now
   */
  isProviderAvailableNow(provider: ProviderProfile): boolean {
    if (!this.isProviderActive(provider)) return false;
    if (provider.isAlwaysAvailable) return true;

    if (!provider.workingHours) return false;

    const now = new Date();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = dayNames[now.getDay()];
    const todayHours = provider.workingHours[today];

    if (!todayHours) return false;

    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return currentTime >= todayHours.start && currentTime <= todayHours.end;
  }

  /**
   * Sort providers by distance
   * @param providers - Array of providers with distance
   * @returns Sorted array (nearest first)
   */
  sortByDistance(providers: NearestProviderResult[]): NearestProviderResult[] {
    return [...providers].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Filter active providers only
   * @param providers - Array of providers
   * @returns Only active providers
   */
  filterActive(providers: ProviderProfile[]): ProviderProfile[] {
    return providers.filter((p) => this.isProviderActive(p));
  }

  /**
   * Get working hours display for a specific day
   * @param provider - Provider profile
   * @param day - Day of week (lowercase)
   * @returns Formatted hours string or "Closed"
   */
  getWorkingHoursForDay(provider: ProviderProfile, day: string): string {
    if (provider.isAlwaysAvailable) {
      return "24/7";
    }

    if (!provider.workingHours || !provider.workingHours[day]) {
      return "Closed";
    }

    const hours = provider.workingHours[day];
    return `${hours.start} - ${hours.end}`;
  }

  // ============================================
  // LOCATION UTILITIES
  // ============================================

  /**
   * Get user's current location using browser geolocation API
   * @returns Promise with user's coordinates
   */
  async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Get current location and reverse geocode it to get address
   * Convenience method combining getCurrentLocation and reverseGeocode
   * @returns User's current location with address details
   */
  async getCurrentLocationWithAddress(): Promise<ReverseGeocodeResponse> {
    const coords = await this.getCurrentLocation();
    return this.reverseGeocode(coords);
  }

  /**
   * Format distance for display
   * @param distanceKm - Distance in kilometers
   * @returns Formatted distance string (e.g., "1.5km" or "500m")
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }

  /**
   * Validate Ghana Post GPS format
   * @param ghanaPostGPS - GPS code to validate
   * @returns True if valid format
   */
  isValidGhanaPostGPS(ghanaPostGPS: string): boolean {
    // Ghana Post GPS format: XX-XXXX-XXXX (e.g., GA-123-4567)
    const regex = /^[A-Z]{2}-\d{4}-\d{4}$/;
    return regex.test(ghanaPostGPS);
  }

  /**
   * Validate coordinates
   * @param coords - Coordinates to validate
   * @returns True if valid
   */
  isValidCoordinates(coords: Coordinates): boolean {
    return (
      coords.latitude >= -90 &&
      coords.latitude <= 90 &&
      coords.longitude >= -180 &&
      coords.longitude <= 180
    );
  }

  /**
   * Check if coordinates are within Ghana's approximate bounds
   * @param coords - Coordinates to check
   * @returns True if within Ghana's bounds
   */
  isWithinGhanaBounds(coords: Coordinates): boolean {
    // Ghana's approximate bounds
    const MIN_LAT = 4.5;
    const MAX_LAT = 11.5;
    const MIN_LNG = -3.5;
    const MAX_LNG = 1.5;

    return (
      coords.latitude >= MIN_LAT &&
      coords.latitude <= MAX_LAT &&
      coords.longitude >= MIN_LNG &&
      coords.longitude <= MAX_LNG
    );
  }

  /**
   * Format location for display
   * @param location - User location object
   * @returns Formatted address string
   */
  formatLocation(location: UserLocation): string {
    const parts = [
      location.houseNumber,
      location.streetName,
      location.locality,
      location.district,
      location.city,
      location.region,
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Get location display name with landmark
   * @param location - User location object
   * @returns Display string with landmark if available
   */
  getLocationDisplayWithLandmark(location: UserLocation): string {
    const baseLocation = this.formatLocation(location);
    if (location.nearbyLandmark) {
      return `${baseLocation} (Near ${location.nearbyLandmark})`;
    }
    return baseLocation;
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const providerAPI = new UnifiedProviderAPIClient();

// Re-export types for convenience
export type {
  Coordinates,
  UserLocation,
  ContactDetails,
  IdDetails,
  WorkingHours,
  ProviderProfile,
  CreateProviderProfileRequest,
  UpdateProviderProfileRequest,
  NearestProviderResult,
  FindNearestProvidersRequest,
  FindProvidersByLocationParams,
  DistanceResult,
  SearchProvidersRequest,
  SearchProvidersResponse,
  AddServiceRequest,
};

export { idType };
