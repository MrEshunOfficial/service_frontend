// api/services/service.api.ts

import {
  ServiceSearchFilters,
  PaginationOptions,
  PopulationLevel,
  ServiceQueryResult,
  APIResponse,
  Service,
  CompleteServiceResult,
  ServiceAccessibilityResponse,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceStats,
  BulkUpdateResponse,
} from "@/types/service.types";
import { APIClient } from "../base/api-client";

export class ServiceAPI extends APIClient {
  private readonly endpoint = "/api/services";

  // ============================================
  // HELPER METHODS
  // ============================================

  private buildQueryParams(
    filters?: ServiceSearchFilters,
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): URLSearchParams {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.providerId) params.append("providerId", filters.providerId);
      if (filters.minPrice !== undefined)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.tags?.length) params.append("tags", filters.tags.join(","));
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
      if (filters.isPrivate !== undefined)
        params.append("isPrivate", filters.isPrivate.toString());
    }

    if (pagination) {
      if (pagination.page) params.append("page", pagination.page.toString());
      if (pagination.limit) params.append("limit", pagination.limit.toString());
      if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
      if (pagination.sortOrder)
        params.append("sortOrder", pagination.sortOrder);
    }

    if (populationLevel) {
      params.append("populate", populationLevel);
    }

    return params;
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  async getPublicServices(
    filters?: ServiceSearchFilters,
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(filters, pagination, populationLevel);
    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}/public?${params.toString()}`
    );
    return response.data;
  }

  async getServiceBySlug(
    slug: string,
    populationLevel?: PopulationLevel
  ): Promise<Service> {
    const params = new URLSearchParams();
    if (populationLevel) params.append("populate", populationLevel);

    const response = await this.get<APIResponse<Service>>(
      `${this.endpoint}/slug/${slug}?${params.toString()}`
    );
    return response.data;
  }

  // ============================================
  // AUTHENTICATED METHODS
  // ============================================

  async getServiceById(
    id: string,
    populationLevel?: PopulationLevel
  ): Promise<Service> {
    const params = new URLSearchParams();
    if (populationLevel) params.append("populate", populationLevel);

    const response = await this.get<APIResponse<Service>>(
      `${this.endpoint}/${id}?${params.toString()}`
    );
    return response.data;
  }

  async getCompleteService(id: string): Promise<CompleteServiceResult> {
    const response = await this.get<APIResponse<CompleteServiceResult>>(
      `${this.endpoint}/${id}/complete`
    );
    return response.data;
  }

  async getAccessibleServices(
    filters?: ServiceSearchFilters,
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(filters, pagination, populationLevel);
    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}?${params.toString()}`
    );
    return response.data;
  }

  async getServicesByCategory(
    categoryId: string,
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(
      undefined,
      pagination,
      populationLevel
    );
    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}/category/${categoryId}?${params.toString()}`
    );
    return response.data;
  }

  async getServicesByProvider(
    providerId: string,
    options?: {
      includeInactive?: boolean;
      pagination?: PaginationOptions;
      populationLevel?: PopulationLevel;
    }
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(
      undefined,
      options?.pagination,
      options?.populationLevel
    );

    if (options?.includeInactive) {
      params.append("includeInactive", "true");
    }

    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}/provider/${providerId}?${params.toString()}`
    );
    return response.data;
  }

  async searchServices(
    searchTerm: string,
    filters?: ServiceSearchFilters,
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(filters, pagination, populationLevel);
    params.append("q", searchTerm);

    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}/search?${params.toString()}`
    );
    return response.data;
  }

  async checkServiceAccessibility(id: string): Promise<boolean> {
    const response = await this.get<APIResponse<ServiceAccessibilityResponse>>(
      `${this.endpoint}/${id}/accessible`
    );
    return response.data.accessible;
  }

  async createService(data: CreateServiceDTO): Promise<Service> {
    const response = await this.post<APIResponse<Service>>(this.endpoint, data);
    return response.data;
  }

  async updateService(id: string, data: UpdateServiceDTO): Promise<Service> {
    const response = await this.put<APIResponse<Service>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async updateCoverImage(
    id: string,
    coverImageId: string | null
  ): Promise<Service> {
    const response = await this.patch<APIResponse<Service>>(
      `${this.endpoint}/${id}/cover-image`,
      { coverImageId }
    );
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await this.delete<APIResponse<void>>(`${this.endpoint}/${id}`);
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async approveService(id: string): Promise<Service> {
    const response = await this.post<APIResponse<Service>>(
      `${this.endpoint}/${id}/approve`
    );
    return response.data;
  }

  async rejectService(id: string, reason: string): Promise<Service> {
    const response = await this.post<APIResponse<Service>>(
      `${this.endpoint}/${id}/reject`,
      { reason }
    );
    return response.data;
  }

  async restoreService(id: string): Promise<Service> {
    const response = await this.post<APIResponse<Service>>(
      `${this.endpoint}/${id}/restore`
    );
    return response.data;
  }

  async getPendingServices(
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(
      undefined,
      pagination,
      populationLevel
    );
    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}/admin/pending?${params.toString()}`
    );
    return response.data;
  }

  async getAllServices(
    filters?: ServiceSearchFilters,
    pagination?: PaginationOptions,
    populationLevel?: PopulationLevel
  ): Promise<ServiceQueryResult> {
    const params = this.buildQueryParams(filters, pagination, populationLevel);
    const response = await this.get<APIResponse<ServiceQueryResult>>(
      `${this.endpoint}/admin/all?${params.toString()}`
    );
    return response.data;
  }

  async getServiceStats(): Promise<ServiceStats> {
    const response = await this.get<APIResponse<ServiceStats>>(
      `${this.endpoint}/admin/stats`
    );
    return response.data;
  }

  async getServiceImageStatus(id: string): Promise<unknown> {
    const response = await this.get<APIResponse<unknown>>(
      `${this.endpoint}/${id}/admin/image-status`
    );
    return response.data;
  }

  async repairServiceCoverLinks(serviceId?: string): Promise<unknown> {
    const response = await this.post<APIResponse<unknown>>(
      `${this.endpoint}/admin/repair-cover-links`,
      { serviceId }
    );
    return response.data;
  }

  async bulkUpdateServices(
    serviceIds: string[],
    update: Partial<Service>
  ): Promise<BulkUpdateResponse> {
    const response = await this.post<APIResponse<BulkUpdateResponse>>(
      `${this.endpoint}/admin/bulk-update`,
      { serviceIds, update }
    );
    return response.data;
  }
}

// Export singleton instance
export const serviceAPI = new ServiceAPI();
