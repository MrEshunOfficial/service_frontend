// api/category.api.ts

import {
  CategoryObject,
  Category,
  CategoryWithServices,
} from "@/types/category.types";
import { APIClient } from "../base/api-client";

/**
 * API Response types
 */
interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

interface CompleteCategoryResponse {
  category: CategoryObject;
  coverImageUrl?: string;
}

interface CategoryStatsResponse {
  totalCategories: number;
  activeCategories: number;
  deletedCategories: number;
  categoriesWithServices?: number;
  topCategories?: Array<{
    _id: string;
    catName: string;
    servicesCount: number;
  }>;
}

interface ImageStatusResponse {
  categoryId: string;
  catCoverId?: string;
  coverImageExists: boolean;
  coverImageUrl?: string;
}

interface BulkUpdateResult {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
}

/**
 * Request types
 */
interface CreateCategoryRequest {
  catName: string;
  catDesc: string;
  catCoverId?: string;
  tags?: string[];
  isActive?: boolean;
  parentCategoryId?: string;
  slug?: string;
}

interface UpdateCategoryRequest {
  catName?: string;
  catDesc?: string;
  catCoverId?: string;
  tags?: string[];
  isActive?: boolean;
  parentCategoryId?: string;
  slug?: string;
}

interface SearchCategoriesParams {
  q: string;
  limit?: number;
  skip?: number;
  activeOnly?: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface PaginationParams {
  limit?: number;
  skip?: number;
  [key: string]: string | number | boolean | undefined;
}

interface BulkUpdateRequest {
  categoryIds: string[];
  updates: Partial<UpdateCategoryRequest>;
}

/**
 * Category API Client
 *
 * Handles all HTTP requests related to categories
 */
export class CategoryAPI extends APIClient {
  private readonly endpoint = "/api/categories";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Create a new category
   */
  async createCategory(
    data: CreateCategoryRequest
  ): Promise<APIResponse<Category>> {
    return this.post<APIResponse<Category>>(this.endpoint, data);
  }

  /**
   * Update category by ID
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<APIResponse<Category>> {
    return this.put<APIResponse<Category>>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Update category cover image
   */
  async updateCoverImage(
    id: string,
    catCoverId: string | null
  ): Promise<APIResponse<Category>> {
    return this.put<APIResponse<Category>>(
      `${this.endpoint}/${id}/cover-image`,
      { catCoverId }
    );
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id: string): Promise<APIResponse<void>> {
    return this.delete<APIResponse<void>>(`${this.endpoint}/${id}`);
  }

  /**
   * Restore soft deleted category
   */
  async restoreCategory(id: string): Promise<APIResponse<Category>> {
    return this.post<APIResponse<Category>>(`${this.endpoint}/${id}/restore`);
  }

  /**
   * Permanently delete category
   */
  async permanentlyDeleteCategory(id: string): Promise<APIResponse<void>> {
    return this.delete<APIResponse<void>>(`${this.endpoint}/${id}/permanent`);
  }

  // ============================================================================
  // Retrieval Operations
  // ============================================================================

  /**
   * Get category by ID
   */
  async getCategoryById(
    id: string,
    includeDetails = false
  ): Promise<APIResponse<Category>> {
    return this.get<APIResponse<Category>>(`${this.endpoint}/${id}`, {
      includeDetails,
    });
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(
    slug: string,
    includeDetails = false
  ): Promise<APIResponse<Category>> {
    return this.get<APIResponse<Category>>(`${this.endpoint}/slug/${slug}`, {
      includeDetails,
    });
  }

  /**
   * Get complete category with cover image URL
   */
  async getCompleteCategory(
    id: string
  ): Promise<APIResponse<CompleteCategoryResponse>> {
    return this.get<APIResponse<CompleteCategoryResponse>>(
      `${this.endpoint}/${id}/complete`
    );
  }

  /**
   * Get all active categories
   */
  async getActiveCategories(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Category>> {
    return this.get<PaginatedResponse<Category>>(
      `${this.endpoint}/active`,
      params
    );
  }

  /**
   * Get top-level categories (no parent)
   */
  async getTopLevelCategories(
    includeSubcategories = false
  ): Promise<APIResponse<CategoryWithServices[]>> {
    return this.get<APIResponse<CategoryWithServices[]>>(
      `${this.endpoint}/top-level`,
      { includeSubcategories }
    );
  }

  /**
   * Get subcategories of a parent category
   */
  async getSubcategories(
    id: string
  ): Promise<APIResponse<CategoryWithServices[]>> {
    return this.get<APIResponse<CategoryWithServices[]>>(
      `${this.endpoint}/${id}/subcategories`
    );
  }

  /**
   * Get category hierarchy (full tree structure)
   */
  async getCategoryHierarchy(): Promise<APIResponse<CategoryWithServices[]>> {
    return this.get<APIResponse<CategoryWithServices[]>>(
      `${this.endpoint}/hierarchy`
    );
  }

  /**
   * Search categories
   */
  async searchCategories(
    params: SearchCategoriesParams
  ): Promise<PaginatedResponse<Category>> {
    return this.get<PaginatedResponse<Category>>(
      `${this.endpoint}/search`,
      params as unknown as SearchCategoriesParams
    );
  }

  /**
   * Get categories by tag
   */
  async getCategoriesByTag(
    tag: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Category>> {
    return this.get<PaginatedResponse<Category>>(
      `${this.endpoint}/tag/${tag}`,
      params
    );
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<APIResponse<string[]>> {
    return this.get<APIResponse<string[]>>(`${this.endpoint}/tags`);
  }

  // ============================================================================
  // Admin Operations
  // ============================================================================

  /**
   * Get all categories (admin)
   */
  async getAllCategories(
    params?: PaginationParams & { includeDeleted?: boolean }
  ): Promise<PaginatedResponse<Category>> {
    return this.get<PaginatedResponse<Category>>(
      `${this.endpoint}/admin/all`,
      params as unknown as PaginationParams
    );
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(
    categoryId?: string
  ): Promise<APIResponse<CategoryStatsResponse>> {
    return this.get<APIResponse<CategoryStatsResponse>>(
      `${this.endpoint}/stats`,
      categoryId ? { categoryId } : undefined
    );
  }

  /**
   * Check if category exists
   */
  async checkCategoryExists(
    id: string
  ): Promise<APIResponse<{ exists: boolean }>> {
    return this.get<APIResponse<{ exists: boolean }>>(
      `${this.endpoint}/${id}/exists`
    );
  }

  /**
   * Check if slug is available
   */
  async checkSlugAvailability(
    slug: string,
    excludeCategoryId?: string
  ): Promise<APIResponse<{ available: boolean }>> {
    return this.get<APIResponse<{ available: boolean }>>(
      `${this.endpoint}/slug/${slug}/available`,
      excludeCategoryId ? { excludeCategoryId } : undefined
    );
  }

  /**
   * Get category image status
   */
  async getCategoryImageStatus(
    id: string
  ): Promise<APIResponse<ImageStatusResponse>> {
    return this.get<APIResponse<ImageStatusResponse>>(
      `${this.endpoint}/${id}/image-status`
    );
  }

  /**
   * Repair broken category cover image links
   */
  async repairCoverLinks(
    categoryId?: string
  ): Promise<APIResponse<{ repairedCount: number }>> {
    return this.post<APIResponse<{ repairedCount: number }>>(
      `${this.endpoint}/repair-cover-links`,
      categoryId ? { categoryId } : {}
    );
  }

  /**
   * Bulk update categories
   */
  async bulkUpdateCategories(
    data: BulkUpdateRequest
  ): Promise<APIResponse<BulkUpdateResult>> {
    return this.put<APIResponse<BulkUpdateResult>>(
      `${this.endpoint}/bulk-update`,
      data
    );
  }

  /**
   * Toggle category active status
   */
  async toggleActiveStatus(id: string): Promise<APIResponse<Category>> {
    return this.patch<APIResponse<Category>>(
      `${this.endpoint}/${id}/toggle-active`
    );
  }
}

// Export singleton instance
export const categoryAPI = new CategoryAPI();
