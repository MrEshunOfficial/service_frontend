// api/service.api.ts
import type { Service } from "@/types/service.types";
import { APIClient } from "../base/api-client";

// ── Request / Response types ──────────────────────────────────────────────────

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
  /**
   * The provider creating this service.
   * A single provider ID string — NOT an array.
   * Omit for admin-created catalog/system services.
   */
  providerId?: string;
  servicePricing?: {
    serviceBasePrice: number;
    includeTravelFee: boolean;
    includeAdditionalFees: boolean;
    currency: string;
    platformCommissionRate: number;
    providerEarnings?: number;
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

export interface ReassignProviderData {
  /** The ID of the new provider to assign this service to */
  newProviderId: string;
}

export interface UpdateCoverImageData {
  /** Pass null to unlink the existing cover image */
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

// ── API Client ────────────────────────────────────────────────────────────────

class ServiceAPI extends APIClient {
  private readonly endpoint = "/api/services";

  // ── Public (no auth required) ─────────────────────────────────────────────

  /**
   * Get public services
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
   */
  async getServiceBySlug(slug: string): Promise<Service> {
    return this.get<Service>(`${this.endpoint}/slug/${slug}`);
  }

  // ── Authenticated ─────────────────────────────────────────────────────────

  /**
   * Full-text search across services
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
   * Get services visible to the current user based on access level
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
   */
  async getServiceById(id: string): Promise<Service> {
    return this.get<Service>(`${this.endpoint}/${id}`);
  }

  /**
   * Get complete service with full details including cover image URL
   */
  async getCompleteService(id: string): Promise<Service> {
    return this.get<Service>(`${this.endpoint}/${id}/complete`);
  }

  /**
   * Get services by category
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
   * Get services belonging to a single provider.
   * `providerId` is a scalar string — one service belongs to one provider.
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
   * Check whether the current user can access this service
   */
  async checkServiceAccessibility(id: string): Promise<AccessibilityResponse> {
    return this.get<AccessibilityResponse>(`${this.endpoint}/${id}/accessible`);
  }

  /**
   * Create a new service.
   * When `providerId` is supplied the service is automatically linked to that
   * provider's `serviceOfferings` on the server side.
   */
  async createService(data: CreateServiceData): Promise<Service> {
    return this.post<Service>(this.endpoint, data);
  }

  /**
   * Update service fields
   */
  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    return this.put<Service>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Reassign a service to a different provider (admin or owner).
   * Automatically unlinks from the old provider and links to the new one.
   */
  async reassignProvider(
    id: string,
    data: ReassignProviderData
  ): Promise<Service> {
    return this.patch<Service>(`${this.endpoint}/${id}/reassign-provider`, data);
  }

  /**
   * Update the service cover image.
   * Pass `{ coverImageId: null }` to unlink the existing image.
   */
  async updateCoverImage(
    id: string,
    data: UpdateCoverImageData
  ): Promise<Service> {
    return this.patch<Service>(`${this.endpoint}/${id}/cover-image`, data);
  }

  /**
   * Soft-delete a service.
   * Also removes the service from its provider's serviceOfferings.
   */
  async deleteService(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`${this.endpoint}/${id}`);
  }

  // ── Admin only ────────────────────────────────────────────────────────────

  /**
   * Get pending services awaiting moderation
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
   * Get all services (admin view, includes inactive/deleted)
   */
  async getAllServices(
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>(
      `${this.endpoint}/admin/all`,
      filters as Record<string, string | number | boolean | undefined>
    );
  }

  /**
   * Get service statistics (admin)
   */
  async getServiceStats(): Promise<ServiceStats> {
    return this.get<ServiceStats>(`${this.endpoint}/admin/stats`);
  }

  /**
   * Get cover image status for a service (admin / debugging)
   */
  async getServiceImageStatus(id: string): Promise<ServiceImageStatus> {
    return this.get<ServiceImageStatus>(
      `${this.endpoint}/${id}/admin/image-status`
    );
  }

  /**
   * Approve a service (admin)
   */
  async approveService(id: string): Promise<Service> {
    return this.post<Service>(`${this.endpoint}/${id}/approve`);
  }

  /**
   * Reject a service with a reason (admin)
   */
  async rejectService(id: string, data: RejectServiceData): Promise<Service> {
    return this.post<Service>(`${this.endpoint}/${id}/reject`, data);
  }

  /**
   * Restore a soft-deleted service (admin).
   * Also re-adds the service to its provider's serviceOfferings.
   */
  async restoreService(id: string): Promise<Service> {
    return this.post<Service>(`${this.endpoint}/${id}/restore`);
  }

  /**
   * Repair broken cover image links (admin)
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
   * Bulk update multiple services (admin)
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