// api/clients/client-profile.api.ts

import {
  StatisticsResponse,
  RegionData,
  ClientProfile,
  EnrichLocationRequest,
  EnrichLocationResponse,
  VerifyLocationRequest,
  VerifyLocationResponse,
  GeocodeAddressRequest,
  GeocodeAddressResponse,
  CalculateDistanceRequest,
  CalculateDistanceResponse,
  FindNearestClientsRequest,
  NearestClientResult,
  FindClientsByLocationParams,
  SearchClientsParams,
  CreateClientProfileRequest,
  CompleteClientProfile,
  UpdateClientProfileRequest,
  UpdateIdDetailsRequest,
  ManageFavoritesRequest,
  ManageAddressRequest,
  UpdateCommunicationPreferencesRequest,
  CommunicationPreferences,
  ClientStats,
  AddPaymentMethodRequest,
  SavedPaymentMethod,
  UpdateEmergencyContactRequest,
  EmergencyContact,
  UpdatePreferredCategoriesRequest,
  UpdateLanguagePreferenceRequest,
  VerificationDetails,
  VerificationStatus,
} from "@/types/profiles/client.profile.types";
import { APIClient } from "../base/api-client";
import { PaginatedResponse } from "../services/service.api";

// ============================================================================
// CLIENT PROFILE API CLASS
// ============================================================================

export class ClientProfileAPI extends APIClient {
  private readonly baseEndpoint = "/api/clients";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ==========================================================================
  // PUBLIC & UTILITY METHODS
  // ==========================================================================

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get(`${this.baseEndpoint}/health`);
  }

  /**
   * Get platform-wide client statistics
   */
  async getStatistics(): Promise<StatisticsResponse> {
    return this.get(`${this.baseEndpoint}/statistics`);
  }

  /**
   * Get list of available regions with client counts
   */
  async getAvailableRegions(): Promise<RegionData[]> {
    return this.get(`${this.baseEndpoint}/regions`);
  }

  /**
   * Get all verified clients with pagination
   */
  async getAllVerifiedClients(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ClientProfile>> {
    return this.get(`${this.baseEndpoint}/verified`, params);
  }

  // ==========================================================================
  // LOCATION UTILITY METHODS
  // ==========================================================================

  /**
   * Enrich location data using Ghana Post GPS
   */
  async enrichLocation(
    data: EnrichLocationRequest
  ): Promise<EnrichLocationResponse> {
    return this.post(`${this.baseEndpoint}/location/enrich`, data);
  }

  /**
   * Verify location coordinates against Ghana Post GPS
   */
  async verifyLocation(
    data: VerifyLocationRequest
  ): Promise<VerifyLocationResponse> {
    return this.post(`${this.baseEndpoint}/location/verify`, data);
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(
    data: GeocodeAddressRequest
  ): Promise<GeocodeAddressResponse> {
    return this.post(`${this.baseEndpoint}/location/geocode`, data);
  }

  /**
   * Calculate distance between two coordinates
   */
  async calculateDistance(
    data: CalculateDistanceRequest
  ): Promise<CalculateDistanceResponse> {
    return this.post(`${this.baseEndpoint}/location/distance`, data);
  }

  // ==========================================================================
  // SEARCH & DISCOVERY METHODS
  // ==========================================================================

  /**
   * Find nearest clients to a location
   */
  async findNearestClients(
    data: FindNearestClientsRequest
  ): Promise<NearestClientResult[]> {
    return this.post(`${this.baseEndpoint}/search/nearest`, data);
  }

  /**
   * Find clients by region and city
   */
  async findClientsByLocation(
    params: FindClientsByLocationParams
  ): Promise<PaginatedResponse<ClientProfile>> {
    return this.get(`${this.baseEndpoint}/search/location`, params);
  }

  /**
   * Advanced client search with multiple filters
   */
  async searchClients(
    params: SearchClientsParams
  ): Promise<PaginatedResponse<ClientProfile>> {
    return this.get(`${this.baseEndpoint}/search`, params);
  }

  /**
   * Get clients who favorited a specific service
   */
  async getClientsByFavoriteService(
    serviceId: string
  ): Promise<ClientProfile[]> {
    return this.get(`${this.baseEndpoint}/favorites/service/${serviceId}`);
  }

  /**
   * Get clients who favorited a specific provider
   */
  async getClientsByFavoriteProvider(
    providerId: string
  ): Promise<ClientProfile[]> {
    return this.get(`${this.baseEndpoint}/favorites/provider/${providerId}`);
  }

  // ==========================================================================
  // "ME" METHODS - Current authenticated user's profile
  // ==========================================================================

  /**
   * Create a new client profile for current user
   */
  async createMyProfile(
    data: CreateClientProfileRequest
  ): Promise<ClientProfile> {
    return this.post(`${this.baseEndpoint}`, data);
  }

  /**
   * Get current user's client profile
   */
  async getMyProfile(): Promise<ClientProfile> {
    return this.get(`${this.baseEndpoint}/me`);
  }

  /**
   * Get complete client profile with stats and enriched data
   */
  async getMyCompleteProfile(): Promise<CompleteClientProfile> {
    return this.get(`${this.baseEndpoint}/me/complete`);
  }

  /**
   * Update current user's client profile
   */
  async updateMyProfile(
    data: UpdateClientProfileRequest
  ): Promise<ClientProfile> {
    return this.patch(`${this.baseEndpoint}/me`, data);
  }

  /**
   * Update ID details for current user's client profile
   */
  async updateMyIdDetails(
    data: UpdateIdDetailsRequest
  ): Promise<ClientProfile> {
    return this.patch(`${this.baseEndpoint}/me/id-details`, data);
  }

  /**
   * Manage favorites for current user
   */
  async manageMyFavorites(
    data: ManageFavoritesRequest
  ): Promise<ClientProfile> {
    return this.post(`${this.baseEndpoint}/me/favorites`, data);
  }

  /**
   * Manage addresses for current user
   */
  async manageMyAddress(data: ManageAddressRequest): Promise<ClientProfile> {
    return this.post(`${this.baseEndpoint}/me/addresses`, data);
  }

  /**
   * Update communication preferences for current user
   */
  async updateMyCommunicationPreferences(
    data: UpdateCommunicationPreferencesRequest
  ): Promise<CommunicationPreferences> {
    return this.patch(
      `${this.baseEndpoint}/me/communication-preferences`,
      data
    );
  }

  // ==========================================================================
  // SPECIFIC CLIENT METHODS (Admin operations)
  // ==========================================================================

  /**
   * Get client profile by user ID (Admin only)
   */
  async getClientByUserId(userId: string): Promise<ClientProfile> {
    return this.get(`${this.baseEndpoint}/user/${userId}`);
  }

  /**
   * Get client profile by ID
   */
  async getClientProfile(clientId: string): Promise<ClientProfile> {
    return this.get(`${this.baseEndpoint}/${clientId}`);
  }

  /**
   * Update client profile (Admin only)
   */
  async updateClientProfile(
    clientId: string,
    data: UpdateClientProfileRequest
  ): Promise<ClientProfile> {
    return this.patch(`${this.baseEndpoint}/${clientId}`, data);
  }

  /**
   * Soft delete client profile (Admin only)
   */
  async deleteClientProfile(clientId: string): Promise<{ message: string }> {
    return this.delete(`${this.baseEndpoint}/${clientId}`);
  }

  /**
   * Restore soft-deleted client profile (Admin only)
   */
  async restoreClientProfile(clientId: string): Promise<ClientProfile> {
    return this.post(`${this.baseEndpoint}/${clientId}/restore`);
  }

  /**
   * Update ID details (Admin only)
   */
  async updateIdDetails(
    clientId: string,
    data: UpdateIdDetailsRequest
  ): Promise<ClientProfile> {
    return this.patch(`${this.baseEndpoint}/${clientId}/id-details`, data);
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<ClientStats> {
    return this.get(`${this.baseEndpoint}/${clientId}/stats`);
  }

  // ==========================================================================
  // FAVORITES MANAGEMENT (Admin operations)
  // ==========================================================================

  /**
   * Add or remove favorite services/providers (Admin only)
   */
  async manageFavorites(
    clientId: string,
    data: ManageFavoritesRequest
  ): Promise<ClientProfile> {
    return this.post(`${this.baseEndpoint}/${clientId}/favorites`, data);
  }

  // ==========================================================================
  // ADDRESS MANAGEMENT (Admin operations)
  // ==========================================================================

  /**
   * Manage saved addresses (Admin only)
   */
  async manageAddress(
    clientId: string,
    data: ManageAddressRequest
  ): Promise<ClientProfile> {
    return this.post(`${this.baseEndpoint}/${clientId}/addresses`, data);
  }

  // ==========================================================================
  // PAYMENT METHODS (Admin operations)
  // ==========================================================================

  /**
   * Add payment method (Admin only)
   */
  async addPaymentMethod(
    clientId: string,
    data: AddPaymentMethodRequest
  ): Promise<SavedPaymentMethod> {
    return this.post(`${this.baseEndpoint}/${clientId}/payment-methods`, data);
  }

  /**
   * Remove payment method (Admin only)
   */
  async removePaymentMethod(
    clientId: string,
    paymentMethodId: string
  ): Promise<{ message: string }> {
    return this.delete(
      `${this.baseEndpoint}/${clientId}/payment-methods/${paymentMethodId}`
    );
  }

  // ==========================================================================
  // COMMUNICATION PREFERENCES (Admin operations)
  // ==========================================================================

  /**
   * Update communication preferences (Admin only)
   */
  async updateCommunicationPreferences(
    clientId: string,
    data: UpdateCommunicationPreferencesRequest
  ): Promise<CommunicationPreferences> {
    return this.patch(
      `${this.baseEndpoint}/${clientId}/communication-preferences`,
      data
    );
  }

  // ==========================================================================
  // EMERGENCY CONTACT (Admin operations)
  // ==========================================================================

  /**
   * Update emergency contact (Admin only)
   */
  async updateEmergencyContact(
    clientId: string,
    data: UpdateEmergencyContactRequest
  ): Promise<EmergencyContact> {
    return this.patch(
      `${this.baseEndpoint}/${clientId}/emergency-contact`,
      data
    );
  }

  /**
   * Remove emergency contact (Admin only)
   */
  async removeEmergencyContact(clientId: string): Promise<{ message: string }> {
    return this.delete(`${this.baseEndpoint}/${clientId}/emergency-contact`);
  }

  // ==========================================================================
  // PREFERENCES (Admin operations)
  // ==========================================================================

  /**
   * Update preferred categories (Admin only)
   */
  async updatePreferredCategories(
    clientId: string,
    data: UpdatePreferredCategoriesRequest
  ): Promise<ClientProfile> {
    return this.patch(
      `${this.baseEndpoint}/${clientId}/preferred-categories`,
      data
    );
  }

  /**
   * Update language preference (Admin only)
   */
  async updateLanguagePreference(
    clientId: string,
    data: UpdateLanguagePreferenceRequest
  ): Promise<ClientProfile> {
    return this.patch(
      `${this.baseEndpoint}/${clientId}/language-preference`,
      data
    );
  }

  // ==========================================================================
  // VERIFICATION METHODS (Admin operations)
  // ==========================================================================

  /**
   * Update verification status (Admin only)
   */
  async updateVerificationStatus(
    clientId: string,
    data: Partial<VerificationDetails>
  ): Promise<VerificationDetails> {
    return this.patch(`${this.baseEndpoint}/${clientId}/verification`, data);
  }

  /**
   * Verify phone number (Admin only)
   */
  async verifyPhone(clientId: string): Promise<{ message: string }> {
    return this.post(`${this.baseEndpoint}/${clientId}/verify-phone`);
  }

  /**
   * Verify email (Admin only)
   */
  async verifyEmail(clientId: string): Promise<{ message: string }> {
    return this.post(`${this.baseEndpoint}/${clientId}/verify-email`);
  }

  /**
   * Verify ID document (Admin only)
   */
  async verifyId(clientId: string): Promise<{ message: string }> {
    return this.post(`${this.baseEndpoint}/${clientId}/verify-id`);
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(clientId: string): Promise<VerificationStatus> {
    return this.get(`${this.baseEndpoint}/${clientId}/verification-status`);
  }
}

// ==========================================================================
// EXPORT DEFAULT INSTANCE
// ==========================================================================

export default new ClientProfileAPI();
