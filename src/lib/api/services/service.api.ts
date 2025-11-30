// api/service.api.ts

import { Service } from "@/types/service.types";
import { APIClient } from "../base/api-client";

// Request/Response types
export interface ServiceFilters {
  categoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isActive?: boolean;
  isPrivate?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchServicesParams {
  q: string;
  categoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface CreateServiceData {
  title: string;
  description: string;
  categoryId: string;
  tags?: string[];
  coverImage?: string;
  providerId?: string;
  servicePricing?: {
    serviceBasePrice: number;
    includeTravelFee: boolean;
    includeAdditionalFees: boolean;
    currency: string;
    platformCommissionRate: number;
    providerEarnings: number;
  };
  isPrivate?: boolean;
}

export interface UpdateServiceData {
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
    providerEarnings?: number;
  };
  isPrivate?: boolean;
}

export interface UpdateCoverImageData {
  coverImageId: string | null;
}

export interface RejectServiceData {
  reason: string;
}

export interface RepairCoverLinksData {
  serviceId?: string;
}

export interface BulkUpdateServicesData {
  serviceIds: string[];
  update: Partial<UpdateServiceData>;
}

export interface PaginatedResponse<T> {
  services: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  approved: number;
  rejected: number;
  byCategory: { categoryId: string; count: number }[];
  byProvider: { providerId: string; count: number }[];
}

export interface ServiceImageStatus {
  serviceId: string;
  coverImage: {
    exists: boolean;
    id?: string;
    url?: string;
  };
}

export interface AccessibilityResponse {
  accessible: boolean;
  reason?: string;
}

class ServiceAPI extends APIClient {
  private readonly endpoint = "/api/services";

  // ============================================
  // PUBLIC METHODS (No authentication required)
  // ============================================

  /**
   * Get public services
   * @param filters - Optional filters for services
   */
  async getPublicServices(
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(`${this.endpoint}/public`, {
      ...filters,
      tags: filters?.tags?.join(","),
    });
  }

  /**
   * Get service by slug (public)
   * @param slug - Service slug
   */
  async getServiceBySlug(slug: string): Promise<Service> {
    return this.get<Service>(`${this.endpoint}/slug/${slug}`);
  }

  // ============================================
  // AUTHENTICATED METHODS
  // ============================================

  /**
   * Search services
   * @param params - Search parameters
   */
  async searchServices(
    params: SearchServicesParams
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(`${this.endpoint}/search`, {
      ...params,
      tags: params.tags?.join(","),
    });
  }

  /**
   * Get accessible services based on user access level
   * @param filters - Optional filters for services
   */
  async getAccessibleServices(
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(this.endpoint, {
      ...filters,
      tags: filters?.tags?.join(","),
    });
  }

  /**
   * Get service by ID
   * @param id - Service ID
   */
  async getServiceById(id: string): Promise<Service> {
    return this.get<Service>(`${this.endpoint}/${id}`);
  }

  /**
   * Get complete service with full details including cover image
   * @param id - Service ID
   */
  async getCompleteService(id: string): Promise<Service> {
    return this.get<Service>(`${this.endpoint}/${id}/complete`);
  }

  /**
   * Get services by category
   * @param categoryId - Category ID
   * @param filters - Optional pagination and sorting filters
   */
  async getServicesByCategory(
    categoryId: string,
    filters?: Pick<ServiceFilters, "page" | "limit" | "sortBy" | "sortOrder">
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(
      `${this.endpoint}/category/${categoryId}`,
      filters
    );
  }

  /**
   * Get services by provider
   * @param providerId - Provider ID
   * @param filters - Optional filters including includeInactive (admin only)
   */
  async getServicesByProvider(
    providerId: string,
    filters?: Pick<
      ServiceFilters,
      "page" | "limit" | "sortBy" | "sortOrder"
    > & { includeInactive?: boolean }
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(
      `${this.endpoint}/provider/${providerId}`,
      filters
    );
  }

  /**
   * Check if service is accessible for current user
   * @param id - Service ID
   */
  async checkServiceAccessibility(id: string): Promise<AccessibilityResponse> {
    return this.get<AccessibilityResponse>(
      `${this.endpoint}/${id}/accessible`
    );
  }

  /**
   * Create a new service
   * @param data - Service data
   */
  async createService(data: CreateServiceData): Promise<Service> {
    return this.post<Service>(this.endpoint, data);
  }

  /**
   * Update service
   * @param id - Service ID
   * @param data - Updated service data
   */
  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    return this.put<Service>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Update service cover image
   * @param id - Service ID
   * @param data - Cover image data
   */
  async updateCoverImage(
    id: string,
    data: UpdateCoverImageData
  ): Promise<Service> {
    return this.patch<Service>(`${this.endpoint}/${id}/cover-image`, data);
  }

  /**
   * Delete service (soft delete)
   * @param id - Service ID
   */
  async deleteService(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`${this.endpoint}/${id}`);
  }

  // ============================================
  // ADMIN ONLY METHODS
  // ============================================

  /**
   * Get pending services for moderation
   * @param filters - Optional pagination and sorting filters
   */
  async getPendingServices(
    filters?: Pick<ServiceFilters, "page" | "limit" | "sortBy" | "sortOrder">
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(
      `${this.endpoint}/admin/pending`,
      filters
    );
  }

  /**
   * Get all services (admin view)
   * @param filters - Optional filters for services
   */
  async getAllServices(
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(
  `${this.endpoint}/admin/all`,
  filters as Record<string, string | number | boolean | undefined>
);}

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<ServiceStats> {
    return this.get<ServiceStats>(`${this.endpoint}/admin/stats`);
  }

  /**
   * Get service image status (for debugging)
   * @param id - Service ID
   */
  async getServiceImageStatus(id: string): Promise<ServiceImageStatus> {
    return this.get<ServiceImageStatus>(
      `${this.endpoint}/${id}/admin/image-status`
    );
  }

  /**
   * Approve service
   * @param id - Service ID
   */
  async approveService(id: string): Promise<Service> {
    return this.post<Service>(`${this.endpoint}/${id}/approve`);
  }

  /**
   * Reject service
   * @param id - Service ID
   * @param data - Rejection reason
   */
  async rejectService(id: string, data: RejectServiceData): Promise<Service> {
    return this.post<Service>(`${this.endpoint}/${id}/reject`, data);
  }

  /**
   * Restore soft-deleted service
   * @param id - Service ID
   */
  async restoreService(id: string): Promise<Service> {
    return this.post<Service>(`${this.endpoint}/${id}/restore`);
  }

  /**
   * Repair service cover image links
   * @param data - Optional service ID to repair specific service
   */
  async repairServiceCoverLinks(
    data?: RepairCoverLinksData
  ): Promise<{ message: string; repaired: number }> {
    return this.post<{ message: string; repaired: number }>(
      `${this.endpoint}/admin/repair-cover-links`,
      data
    );
  }

  /**
   * Bulk update services
   * @param data - Service IDs and update object
   */
  async bulkUpdateServices(
    data: BulkUpdateServicesData
  ): Promise<{ message: string; updated: number }> {
    return this.post<{ message: string; updated: number }>(
      `${this.endpoint}/admin/bulk-update`,
      data
    );
  }
}

// Export singleton instance
export const serviceAPI = new ServiceAPI();

// Export class for testing or custom instances
export default ServiceAPI;