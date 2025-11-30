// types/category.types.ts

// ============================================================================
// Frontend Category Types (JSON representations)
// ============================================================================

export interface Category {
  _id: string;
  catName: string;
  catDesc: string;
  catCoverId?: {
    _id: string;
    thumbnailUrl: string;
    url: string;
    fileName: string;
  };
  tags?: string[];
  isActive: boolean;
  parentCategoryId?: string;
  slug: string;
  createdBy?: string;
  lastModifiedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string; // ISO date string
  deletedBy?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CategoryWithServices extends Category {
  services?: any[]; // Replace with your Service type
  servicesCount?: number;
  popularServices?: any[];
  subcategories?: CategoryWithServices[];
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateCategoryRequest {
  catName: string;
  catDesc: string;
  catCoverId?: string;
  tags?: string[];
  isActive?: boolean;
  parentCategoryId?: string;
  slug?: string;
}

export interface UpdateCategoryRequest {
  catName?: string;
  catDesc?: string;
  catCoverId?: string;
  tags?: string[];
  isActive?: boolean;
  parentCategoryId?: string;
  slug?: string;
}

export interface BulkUpdateCategoryRequest {
  categoryIds: string[];
  updates: Partial<UpdateCategoryRequest>;
}

export interface CategorySearchParams {
  query?: string;
  tags?: string[];
  isActive?: boolean;
  parentCategoryId?: string;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface CategoryStatsResponse {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  deletedCategories: number;
  topLevelCategories: number;
  categoriesWithServices: number;
  totalServices: number;
  averageServicesPerCategory: number;
}

export interface CategoryHierarchyNode extends Category {
  children?: CategoryHierarchyNode[];
  depth?: number;
}

export interface SlugAvailabilityResponse {
  available: boolean;
  slug: string;
  suggestion?: string;
}

export interface ImageStatusResponse {
  hasImage: boolean;
  imageId?: string;
  imageUrl?: string;
}