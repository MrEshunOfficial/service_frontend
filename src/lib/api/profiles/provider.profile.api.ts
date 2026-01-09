// api/provider-profile.api.ts
import { IdDetails, PopulationLevel, UserLocation } from "@/types/base.types";
import type {
  ProviderProfile,
  CreateProviderProfileRequest,
  UpdateProviderProfileRequest,
  ProviderProfileResponse,
  ProviderWithDistance,
  ProviderWithMatchedServices,
  SearchProvidersResponse,
  ProviderStatistics,
  ServiceCoverage,
  LocationVerificationResponse,
  GeocodeResponse,
  NearbyPlace,
  DistanceCalculationResponse,
  BulkOperationsResponse,
  GetAllProvidersResponse,
  AuditLogResponse,
  HealthCheckResponse,
  ProviderSearchParams,
  NearestProvidersParams,
  LocationEnrichmentRequest,
  LocationVerificationRequest,
  GeocodeRequest,
  ReverseGeocodeRequest,
  NearbySearchRequest,
  DistanceCalculationRequest,
  BulkOperationsRequest,
  ProviderReportParams,
  GetAllProvidersParams,
  GetAuditLogParams,
  NearbyServiceProvidersParams,
} from "@/types/profiles/provider-profile.types";
import { APIClient } from "../base/api-client";

/**
 * Provider Profile API Client
 * Handles all provider profile related operations
 */
export class ProviderProfileAPI extends APIClient {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ============================================
  // PROVIDER PROFILE CRUD OPERATIONS
  // ============================================

  /**
   * Create a new provider profile for the current user
   */
  async createProviderProfile(
    data: CreateProviderProfileRequest
  ): Promise<ProviderProfile> {
    return this.post<ProviderProfile>("/api/providers", data);
  }

  /**
   * Get current user's provider profile
   */
  async getMyProviderProfile(
    populate: PopulationLevel = PopulationLevel.STANDARD
  ): Promise<ProviderProfile> {
    return this.get<ProviderProfile>("/api/providers/me", {
      populate,
    });
  }

  /**
   * Update current user's provider profile
   */
  async updateMyProviderProfile(
    data: UpdateProviderProfileRequest
  ): Promise<ProviderProfile> {
    return this.patch<ProviderProfile>("/api/providers/me", data);
  }

  /**
   * Update current user's ID details
   */
  async updateMyIdDetails(idDetails: IdDetails): Promise<ProviderProfile> {
    return this.patch<ProviderProfile>(
      "/api/provider-profile/me/id-details",
      idDetails
    );
  }

  /**
   * Delete current user's provider profile (soft delete)
   */
  async deleteMyProviderProfile(): Promise<ProviderProfileResponse> {
    return this.delete<ProviderProfileResponse>("/api/providers/me");
  }

  /**
   * Restore current user's soft-deleted provider profile
   */
  async restoreMyProviderProfile(): Promise<ProviderProfile> {
    return this.post<ProviderProfile>("/api/providers/me/restore");
  }

  /**
   * Get provider profile by provider ID
   */
  async getProviderProfile(
    providerId: string,
    populate: PopulationLevel = PopulationLevel.STANDARD
  ): Promise<ProviderProfile> {
    return this.get<ProviderProfile>(`/api/providers/${providerId}`, {
      populate,
    });
  }

  /**
   * Get provider profile by user ID
   */
  async getProviderByUserId(
    userId: string,
    populate: PopulationLevel = PopulationLevel.STANDARD
  ): Promise<ProviderProfile> {
    return this.get<ProviderProfile>(`/api/providers/user/${userId}`, {
      populate,
    });
  }

  /**
   * Update provider profile by provider ID (admin or owner)
   */
  async updateProviderProfile(
    providerId: string,
    data: UpdateProviderProfileRequest
  ): Promise<ProviderProfile> {
    return this.patch<ProviderProfile>(`/api/providers/${providerId}`, data);
  }

  /**
   * Update ID details by provider ID (admin or owner)
   */
  async updateIdDetails(
    providerId: string,
    idDetails: IdDetails
  ): Promise<ProviderProfile> {
    return this.patch<ProviderProfile>(
      `/api/providers/${providerId}/id-details`,
      idDetails
    );
  }

  /**
   * Delete provider profile by provider ID (admin or owner)
   */
  async deleteProviderProfile(
    providerId: string
  ): Promise<ProviderProfileResponse> {
    return this.delete<ProviderProfileResponse>(`/api/providers/${providerId}`);
  }

  /**
   * Restore provider profile by provider ID
   */
  async restoreProviderProfile(providerId: string): Promise<ProviderProfile> {
    return this.post<ProviderProfile>(
      `/api/provider-profile/${providerId}/restore`
    );
  }

  // ============================================
  // SEARCH & DISCOVERY
  // ============================================

  /**
   * Search providers with advanced filters
   */
  async searchProviders(
    params: ProviderSearchParams
  ): Promise<SearchProvidersResponse> {
    return this.post<SearchProvidersResponse>("/api/providers/search", params);
  }

  /**
   * Find nearest providers by GPS coordinates
   */
  async findNearestProviders(
    params: NearestProvidersParams
  ): Promise<ProviderWithDistance[]> {
    return this.post<ProviderWithDistance[]>(
      "/api/provider-profile/search/nearest",
      params
    );
  }

  /**
   * Find providers by location (region/city)
   */
  async findProvidersByLocation(
    region: string,
    city?: string,
    populate: PopulationLevel = PopulationLevel.STANDARD
  ): Promise<ProviderProfile[]> {
    return this.get<ProviderProfile[]>(
      "/api/provider-profile/search/location",
      {
        region,
        city,
        populate,
      }
    );
  }

  /**
   * Find providers by specific service
   */
  async findProvidersByService(
    serviceId: string,
    populate: PopulationLevel = PopulationLevel.STANDARD
  ): Promise<ProviderProfile[]> {
    return this.get<ProviderProfile[]>(
      `/api/provider-profile/search/by-service/${serviceId}`,
      { populate }
    );
  }

  /**
   * Find nearby providers offering specific services
   */
  async findNearbyServiceProviders(
    params: NearbyServiceProvidersParams
  ): Promise<ProviderWithMatchedServices[]> {
    return this.post<ProviderWithMatchedServices[]>(
      "/api/provider-profile/search/nearby-services",
      params
    );
  }

  /**
   * Find company-trained providers
   */
  async findCompanyTrainedProviders(
    region?: string,
    populate: PopulationLevel = PopulationLevel.STANDARD
  ): Promise<ProviderProfile[]> {
    return this.get<ProviderProfile[]>(
      "/api/provider-profile/search/company-trained",
      {
        region,
        populate,
      }
    );
  }

  /**
   * Calculate distance to specific provider
   */
  async getDistanceToProvider(
    providerId: string,
    fromLatitude: number,
    fromLongitude: number
  ): Promise<DistanceCalculationResponse> {
    return this.post<DistanceCalculationResponse>(
      `/api/provider-profile/${providerId}/distance`,
      {
        fromLatitude,
        fromLongitude,
      }
    );
  }

  // ============================================
  // LOCATION SERVICES
  // ============================================

  /**
   * Enrich location data using Ghana Post GPS or address
   */
  async enrichLocation(data: LocationEnrichmentRequest): Promise<UserLocation> {
    return this.post<UserLocation>(
      "/api/provider-profile/location/enrich",
      data
    );
  }

  /**
   * Verify location coordinates
   */
  async verifyLocation(
    data: LocationVerificationRequest
  ): Promise<LocationVerificationResponse> {
    return this.post<LocationVerificationResponse>(
      "/api/provider-profile/location/verify",
      data
    );
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(data: GeocodeRequest): Promise<GeocodeResponse> {
    return this.post<GeocodeResponse>(
      "/api/provider-profile/location/geocode",
      data
    );
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(data: ReverseGeocodeRequest): Promise<UserLocation> {
    return this.post<UserLocation>(
      "/api/provider-profile/location/reverse-geocode",
      data
    );
  }

  /**
   * Search for nearby places
   */
  async searchNearby(data: NearbySearchRequest): Promise<NearbyPlace[]> {
    return this.post<NearbyPlace[]>(
      "/api/provider-profile/location/search-nearby",
      data
    );
  }

  /**
   * Calculate distance between two points
   */
  async calculateDistance(
    data: DistanceCalculationRequest
  ): Promise<DistanceCalculationResponse> {
    return this.post<DistanceCalculationResponse>(
      "/api/provider-profile/location/calculate-distance",
      data
    );
  }

  // ============================================
  // STATISTICS & METADATA
  // ============================================

  /**
   * Get provider statistics
   */
  async getStatistics(): Promise<ProviderStatistics> {
    return this.get<ProviderStatistics>("/api/provider-profile/stats");
  }

  /**
   * Get available regions
   */
  async getAvailableRegions(): Promise<string[]> {
    return this.get<string[]>("/api/provider-profile/regions");
  }

  /**
   * Get available cities (optionally filtered by region)
   */
  async getAvailableCities(region?: string): Promise<string[]> {
    return this.get<string[]>("/api/provider-profile/cities", { region });
  }

  /**
   * Get service coverage for a specific service
   */
  async getServiceCoverage(serviceId: string): Promise<ServiceCoverage> {
    return this.get<ServiceCoverage>(
      `/api/provider-profile/service-coverage/${serviceId}`
    );
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.get<HealthCheckResponse>("/api/provider-profile/health");
  }

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  /**
   * Get all providers with pagination and filtering (admin)
   */
  async getAllProviders(
    params?: GetAllProvidersParams
  ): Promise<GetAllProvidersResponse> {
    return this.get<GetAllProvidersResponse>(
      "/api/provider-profile/admin/all",
      params
    );
  }

  /**
   * Get provider statistics (admin view)
   */
  async getProviderStatistics(): Promise<ProviderStatistics> {
    return this.get<ProviderStatistics>(
      "/api/provider-profile/admin/statistics"
    );
  }

  /**
   * Generate comprehensive provider report (admin)
   */
  async generateProviderReport(
    params?: ProviderReportParams
  ): Promise<Blob | Record<string, any>> {
    return this.get<Blob | Record<string, any>>(
      "/api/provider-profile/admin/report",
      params
    );
  }

  /**
   * Bulk operations on multiple providers (admin)
   */
  async bulkOperations(
    data: BulkOperationsRequest
  ): Promise<BulkOperationsResponse> {
    return this.post<BulkOperationsResponse>(
      "/api/provider-profile/admin/bulk-operations",
      data
    );
  }

  /**
   * Approve a provider profile (admin)
   */
  async approveProvider(providerId: string): Promise<ProviderProfile> {
    return this.post<ProviderProfile>(
      `/api/provider-profile/admin/${providerId}/approve`
    );
  }

  /**
   * Reject a provider profile (admin)
   */
  async rejectProvider(
    providerId: string,
    reason: string
  ): Promise<ProviderProfile> {
    return this.post<ProviderProfile>(
      `/api/provider-profile/admin/${providerId}/reject`,
      { reason }
    );
  }

  /**
   * Suspend a provider profile (admin)
   */
  async suspendProvider(
    providerId: string,
    reason: string
  ): Promise<ProviderProfile> {
    return this.post<ProviderProfile>(
      `/api/provider-profile/admin/${providerId}/suspend`,
      { reason }
    );
  }

  /**
   * Unsuspend a provider profile (admin)
   */
  async unsuspendProvider(providerId: string): Promise<ProviderProfile> {
    return this.post<ProviderProfile>(
      `/api/provider-profile/admin/${providerId}/unsuspend`
    );
  }

  /**
   * Get audit log for a provider (admin)
   */
  async getProviderAuditLog(
    providerId: string,
    params?: GetAuditLogParams
  ): Promise<AuditLogResponse> {
    return this.get<AuditLogResponse>(
      `/api/provider-profile/admin/${providerId}/audit-log`,
      params
    );
  }
}

// Export singleton instance
export const providerProfileAPI = new ProviderProfileAPI();
