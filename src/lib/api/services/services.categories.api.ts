// api/categories/category-api.ts
import { APIClient } from "../base/api-client";
import type {
  Category,
  CategoryWithServices,
  CategoryHierarchyNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkUpdateCategoryRequest,
  CategorySearchParams,
  CategoryStatsResponse,
  SlugAvailabilityResponse,
  ImageStatusResponse,
} from "@/types/category.types";

// ============================================================================
// Category API Client
// ============================================================================

export class CategoryAPI extends APIClient {
  private readonly endpoint = "/api/categories";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ==========================================================================
  // PUBLIC ROUTES (No authentication required)
  // ==========================================================================

  /**
   * Search categories with filters
   */
  async searchCategories(
    params: CategorySearchParams
  ): Promise<CategoryWithServices[]> {
    // Convert array params to query-string compatible format
    const queryParams: Record<string, string | number | boolean | undefined> = {
      query: params.query,
      isActive: params.isActive,
      parentCategoryId: params.parentCategoryId,
      includeDeleted: params.includeDeleted,
      limit: params.limit,
      offset: params.offset,
    };

    // Handle array parameters - convert to comma-separated string
    if (params.tags && params.tags.length > 0) {
      queryParams.tags = params.tags.join(',');
    }

    return this.get<CategoryWithServices[]>(`${this.endpoint}/search`, queryParams);
  }

  /**
   * Get all unique tags across categories
   */
  async getAllTags(): Promise<string[]> {
    return this.get<string[]>(`${this.endpoint}/tags`);
  }

  /**
   * Get categories by specific tag
   */
  async getCategoriesByTag(tag: string): Promise<Category[]> {
    return this.get<Category[]>(`${this.endpoint}/tag/${encodeURIComponent(tag)}`);
  }

  /**
   * Get complete category hierarchy
   */
  async getCategoryHierarchy(): Promise<CategoryHierarchyNode[]> {
    return this.get<CategoryHierarchyNode[]>(`${this.endpoint}/hierarchy`);
  }

  /**
   * Get only top-level categories (no parent)
   */
  async getTopLevelCategories(): Promise<Category[]> {
    return this.get<Category[]>(`${this.endpoint}/top-level`);
  }

  /**
   * Get only active categories
   */
  async getActiveCategories(): Promise<Category[]> {
    return this.get<Category[]>(`${this.endpoint}/active`);
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<CategoryStatsResponse> {
    return this.get<CategoryStatsResponse>(`${this.endpoint}/stats`);
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithServices> {
    return this.get<CategoryWithServices>(
      `${this.endpoint}/slug/${encodeURIComponent(slug)}`
    );
  }

  /**
   * Check if slug is available
   */
  async checkSlugAvailability(
    slug: string,
    excludeCategoryId?: string
  ): Promise<SlugAvailabilityResponse> {
    const params = excludeCategoryId ? { excludeId: excludeCategoryId } : undefined;
    return this.get<SlugAvailabilityResponse>(
      `${this.endpoint}/slug/${encodeURIComponent(slug)}/available`,
      params
    );
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    return this.get<Category>(`${this.endpoint}/${id}`);
  }

  /**
   * Get complete category with all relations
   */
  async getCompleteCategory(id: string): Promise<CategoryWithServices> {
    return this.get<CategoryWithServices>(`${this.endpoint}/${id}/complete`);
  }

  /**
   * Get subcategories of a category
   */
  async getSubcategories(id: string): Promise<Category[]> {
    return this.get<Category[]>(`${this.endpoint}/${id}/subcategories`);
  }

  /**
   * Check if category exists
   */
  async checkCategoryExists(id: string): Promise<boolean> {
    const response = await this.get<{ exists: boolean }>(
      `${this.endpoint}/${id}/exists`
    );
    return response.exists;
  }

  /**
   * Get category image status
   */
  async getCategoryImageStatus(id: string): Promise<ImageStatusResponse> {
    return this.get<ImageStatusResponse>(`${this.endpoint}/${id}/image-status`);
  }

  // ==========================================================================
  // PROTECTED ROUTES (Authentication required)
  // ==========================================================================

  /**
   * Get all categories (admin only)
   */
  async getAllCategories(includeDeleted = false): Promise<Category[]> {
    return this.get<Category[]>(`${this.endpoint}/admin/all`, {
      includeDeleted,
    });
  }

  /**
   * Create new category (admin only)
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return this.post<Category>(this.endpoint, data);
  }

  /**
   * Update category (admin only)
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<Category> {
    return this.put<Category>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Bulk update categories (admin only)
   */
  async bulkUpdateCategories(
    data: BulkUpdateCategoryRequest
  ): Promise<{ updated: number; categories: Category[] }> {
    return this.put<{ updated: number; categories: Category[] }>(
      `${this.endpoint}/bulk-update`,
      data
    );
  }

  /**
   * Soft delete category (admin only)
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`${this.endpoint}/${id}`);
  }

  /**
   * Restore soft-deleted category (admin only)
   */
  async restoreCategory(id: string): Promise<Category> {
    return this.post<Category>(`${this.endpoint}/${id}/restore`);
  }

  /**
   * Permanently delete category (admin only)
   */
  async permanentlyDeleteCategory(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(
      `${this.endpoint}/${id}/permanent`
    );
  }

  /**
   * Update category cover image (admin only)
   */
  async updateCoverImage(
    id: string,
    imageId: string
  ): Promise<Category> {
    return this.put<Category>(`${this.endpoint}/${id}/cover-image`, {
      catCoverId: imageId,
    });
  }

  /**
   * Toggle category active status (admin only)
   */
  async toggleActiveStatus(id: string): Promise<Category> {
    return this.patch<Category>(`${this.endpoint}/${id}/toggle-active`);
  }

  /**
   * Repair broken cover image links (admin only)
   */
  async repairCoverLinks(): Promise<{
    repaired: number;
    categories: Category[];
  }> {
    return this.post<{ repaired: number; categories: Category[] }>(
      `${this.endpoint}/repair-cover-links`
    );
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const categoryAPI = new CategoryAPI();