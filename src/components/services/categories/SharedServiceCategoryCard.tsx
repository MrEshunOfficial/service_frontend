"use client";
import React from "react";
import { Category, CategoryWithServices } from "@/types/category.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Archive,
  ArchiveRestore,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  Share2,
  Star,
  Users,
  Compass,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import {
  useUpdateCategory,
  useDeleteCategory,
  useToggleActiveStatus,
} from "@/hooks/services/categories/useServiceCategories";
import { cn } from "@/lib/utils/utils";

// ============================================================================
// Types and Interfaces
// ============================================================================

export type CategoryVariant = Category | CategoryWithServices;

export type CategoryCardAction =
  | "edit"
  | "archive"
  | "restore"
  | "delete"
  | "moderate"
  | "toggle-status"
  | "share"
  | "book"
  | "explore";

export type CardContext = "admin" | "public" | "dashboard" | "marketplace";

export interface CategoryCardPreset {
  context: CardContext;
  viewMode: "grid" | "list";
  showSelection: boolean;
  showServiceCount: boolean;
  showStatus: boolean;
  showImage: boolean;
  showDescription: boolean;
  showRating?: boolean;
  showBookings?: boolean;
  availableActions: CategoryCardAction[];
  primaryAction: CategoryCardAction;
  maxDescriptionLength?: number;
}

export interface StyleConfig {
  cardClassName?: string;
  badgeClassName?: string;
  textClassName?: string;
}

export interface CategoryCardConfig extends Partial<CategoryCardPreset> {
  customLabels?: {
    [key in CategoryCardAction]?: string;
  };
  inactiveStyle?: StyleConfig;
  deletedStyle?: StyleConfig;
  customActionHandlers?: {
    [key in CategoryCardAction]?: (category: CategoryVariant) => void;
  };
  enableOptimisticUpdates?: boolean;
}

export interface CategoryCardProps {
  category: CategoryVariant;
  config?: CategoryCardConfig;
  preset?: CardContext;
  isSelected?: boolean;
  onToggleSelection?: (category: CategoryVariant) => void;
  onAction?: (action: CategoryCardAction, category: CategoryVariant) => void;
  onUpdate?: (updatedCategory: Category) => void;
  onDelete?: (categoryId: string) => void;
  isLoading?: boolean;
  averageRating?: number;
  totalBookings?: number;
  className?: string;
}

// ============================================================================
// Presets Configuration
// ============================================================================

const PRESETS: Record<CardContext, CategoryCardPreset> = {
  admin: {
    context: "admin",
    viewMode: "grid",
    showSelection: true,
    showServiceCount: true,
    showStatus: true,
    showImage: true,
    showDescription: true,
    showRating: false,
    showBookings: false,
    availableActions: ["explore", "edit", "toggle-status", "archive", "delete"],
    primaryAction: "edit",
    maxDescriptionLength: 100,
  },
  public: {
    context: "public",
    viewMode: "grid",
    showSelection: false,
    showServiceCount: true,
    showStatus: false,
    showImage: true,
    showDescription: true,
    showRating: true,
    showBookings: true,
    availableActions: ["explore", "share"],
    primaryAction: "explore",
    maxDescriptionLength: 80,
  },
  dashboard: {
    context: "dashboard",
    viewMode: "list",
    showSelection: false,
    showServiceCount: true,
    showStatus: true,
    showImage: true,
    showDescription: false,
    showRating: false,
    showBookings: true,
    availableActions: ["explore", "edit"],
    primaryAction: "explore",
  },
  marketplace: {
    context: "marketplace",
    viewMode: "grid",
    showSelection: false,
    showServiceCount: true,
    showStatus: false,
    showImage: true,
    showDescription: true,
    showRating: true,
    showBookings: false,
    availableActions: ["explore", "share"],
    primaryAction: "explore",
    maxDescriptionLength: 120,
  },
};

const DEFAULT_INACTIVE_STYLE: StyleConfig = {
  cardClassName:
    "bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800",
  badgeClassName:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  textClassName: "text-muted-foreground",
};

const DEFAULT_DELETED_STYLE: StyleConfig = {
  cardClassName:
    "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
  badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  textClassName: "text-muted-foreground",
};

// ============================================================================
// Helper Functions
// ============================================================================

const getServiceCount = (category: CategoryVariant): number => {
  if (
    "servicesCount" in category &&
    typeof category.servicesCount === "number"
  ) {
    return category.servicesCount;
  }
  if ("services" in category && Array.isArray(category.services)) {
    return category.services.length;
  }
  return 0;
};

const shouldShowCategory = (
  category: CategoryVariant,
  context: CardContext
): boolean => {
  if (context === "public" || context === "marketplace") {
    return category.isActive && !category.isDeleted;
  }
  return true;
};

const getCoverImageUrl = (category: CategoryVariant): string | null => {
  // Handle populated catCoverId with url property
  if (
    category.catCoverId &&
    typeof category.catCoverId === "object" &&
    "url" in category.catCoverId
  ) {
    return (category.catCoverId as { url: string }).url;
  }
  return null;
};

// ============================================================================
// Sub-components
// ============================================================================

const CategoryImage: React.FC<{
  category: CategoryVariant;
  size: { w: number; h: number; class: string };
}> = ({ category, size }) => {
  const imageUrl = getCoverImageUrl(category);

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-muted relative",
        size.class
      )}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={category.catName}
          width={size.w}
          height={size.h}
          className="object-cover"
          style={{ width: "100%", height: "100%" }}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
          <div className="text-xs text-muted-foreground">No Image</div>
        </div>
      )}
    </div>
  );
};

const ServiceCountDisplay: React.FC<{
  category: CategoryVariant;
  context: CardContext;
}> = ({ category, context }) => {
  const serviceCount = getServiceCount(category);

  if (context === "public" || context === "marketplace") {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>
          {serviceCount} service{serviceCount !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      {serviceCount} service{serviceCount !== 1 ? "s" : ""}
    </p>
  );
};

const RatingDisplay: React.FC<{
  rating: number;
  totalBookings?: number;
}> = ({ rating, totalBookings }) => (
  <div className="flex items-center gap-1 text-xs">
    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
    <span className="font-medium">{rating.toFixed(1)}</span>
    {totalBookings && (
      <span className="text-muted-foreground">({totalBookings})</span>
    )}
  </div>
);

const StatusBadge: React.FC<{
  category: CategoryVariant;
  config: CategoryCardPreset;
}> = ({ category, config }) => {
  if (!config.showStatus) return null;

  if (category.isDeleted) {
    return (
      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
        Deleted
      </Badge>
    );
  }

  if (!category.isActive) {
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-orange-100 text-orange-800">
        Inactive
      </Badge>
    );
  }

  return null;
};

interface ActionConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
}

const ActionButton: React.FC<{
  action: CategoryCardAction;
  category: CategoryVariant;
  config: CategoryCardPreset;
  customLabels?: CategoryCardConfig["customLabels"];
  onAction: (action: CategoryCardAction, category: CategoryVariant) => void;
  variant?: "icon" | "text";
  size?: "sm" | "default";
  disabled?: boolean;
}> = ({
  action,
  category,
  customLabels,
  onAction,
  variant = "icon",
  size = "sm",
  disabled = false,
}) => {
  const getActionConfig = (action: CategoryCardAction): ActionConfig => {
    switch (action) {
      case "edit":
        return {
          icon: Edit,
          label: customLabels?.edit || "Edit",
          className: "",
        };
      case "archive":
        return {
          icon: Archive,
          label: customLabels?.archive || "Archive",
          className: "text-orange-600 hover:text-orange-700",
        };
      case "restore":
        return {
          icon: ArchiveRestore,
          label: customLabels?.restore || "Restore",
          className: "text-green-600 hover:text-green-700",
        };
      case "delete":
        return {
          icon: Trash2,
          label: customLabels?.delete || "Delete",
          className: "text-destructive hover:text-destructive/90",
        };
      case "moderate":
        return {
          icon: Eye,
          label: customLabels?.moderate || "Moderate",
          className: "text-blue-600 hover:text-blue-700",
        };
      case "share":
        return {
          icon: Share2,
          label: customLabels?.share || "Share",
          className: "text-muted-foreground hover:text-blue-600",
        };
      case "explore":
        return {
          icon: Compass,
          label: customLabels?.explore || "Explore",
          className: "text-primary hover:text-primary/90",
        };
      case "toggle-status":
        return {
          icon: category.isActive ? Archive : ArchiveRestore,
          label: category.isActive ? "Deactivate" : "Activate",
          className: category.isActive
            ? "text-orange-600 hover:text-orange-700"
            : "text-green-600 hover:text-green-700",
        };
      case "book":
        return {
          icon: Star,
          label: customLabels?.book || "Book",
          className: "text-primary hover:text-primary/90",
        };
      default:
        return {
          icon: MoreHorizontal,
          label: "Action",
          className: "",
        };
    }
  };

  const actionConfig = getActionConfig(action);
  const Icon = actionConfig.icon;

  return (
    <Button
      variant="ghost"
      size={size}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onAction(action, category);
      }}
      className={cn(variant === "icon" ? "px-2" : "", actionConfig.className)}
      title={actionConfig.label}>
      <Icon className="w-4 h-4" />
      {variant === "text" && <span className="ml-1">{actionConfig.label}</span>}
    </Button>
  );
};

const GridActions: React.FC<{
  category: CategoryVariant;
  config: CategoryCardPreset;
  customLabels?: CategoryCardConfig["customLabels"];
  onAction: (action: CategoryCardAction, category: CategoryVariant) => void;
  disabled?: boolean;
}> = ({ category, config, customLabels, onAction, disabled = false }) => {
  const primaryAction = config.primaryAction;
  const otherActions = config.availableActions.filter(
    (action) => action !== primaryAction
  );

  return (
    <div className="flex justify-between pt-2 border-t">
      <ActionButton
        action={primaryAction}
        category={category}
        config={config}
        customLabels={customLabels}
        onAction={onAction}
        variant="text"
        disabled={disabled}
      />

      {otherActions.length === 1 ? (
        <ActionButton
          action={otherActions[0]}
          category={category}
          config={config}
          customLabels={customLabels}
          onAction={onAction}
          variant="icon"
          disabled={disabled}
        />
      ) : otherActions.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={disabled}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {otherActions.map((action, index) => (
              <React.Fragment key={action}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(action, category);
                  }}
                  disabled={disabled}>
                  <ActionButton
                    action={action}
                    category={category}
                    config={config}
                    customLabels={customLabels}
                    onAction={() => {}}
                    variant="text"
                    disabled={true}
                  />
                </DropdownMenuItem>
                {index < otherActions.length - 1 &&
                  (action === "explore" || action === "edit") && (
                    <DropdownMenuSeparator />
                  )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
};

const ListActions: React.FC<{
  category: CategoryVariant;
  config: CategoryCardPreset;
  customLabels?: CategoryCardConfig["customLabels"];
  onAction: (action: CategoryCardAction, category: CategoryVariant) => void;
  disabled?: boolean;
}> = ({ category, config, customLabels, onAction, disabled = false }) => {
  return (
    <div className="flex gap-1 flex-shrink-0">
      {config.availableActions.slice(0, 2).map((action) => (
        <ActionButton
          key={action}
          action={action}
          category={category}
          config={config}
          customLabels={customLabels}
          onAction={onAction}
          variant="icon"
          disabled={disabled}
        />
      ))}

      {config.availableActions.length > 2 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2"
              disabled={disabled}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {config.availableActions.slice(2).map((action) => (
              <DropdownMenuItem
                key={action}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(action, category);
                }}
                disabled={disabled}>
                <ActionButton
                  action={action}
                  category={category}
                  config={config}
                  customLabels={customLabels}
                  onAction={() => {}}
                  variant="text"
                  disabled={true}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const SharedCategoryCard: React.FC<CategoryCardProps> = ({
  category,
  config: userConfig = {},
  preset = "admin",
  isSelected,
  onToggleSelection,
  onAction,
  onUpdate,
  onDelete,
  isLoading = false,
  averageRating,
  totalBookings,
  className,
}) => {
  const config = { ...PRESETS[preset], ...userConfig };

  // Hooks for built-in actions
  const { updateCategory, loading: updateLoading } = useUpdateCategory({
    onSuccess: (data: unknown) => {
      toast.success("Category updated successfully");
      onUpdate?.(data as Category);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const { deleteCategory, loading: deleteLoading } = useDeleteCategory({
    onSuccess: (categoryId: unknown) => {
      toast.success("Category deleted successfully");
      onDelete?.(categoryId as string);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  const { toggleStatus, loading: toggleLoading } = useToggleActiveStatus({
    onSuccess: (data: unknown) => {
      const updatedCategory = data as Category;
      toast.success(
        `Category ${
          updatedCategory.isActive ? "activated" : "deactivated"
        } successfully`
      );
      onUpdate?.(updatedCategory);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle category status");
    },
  });

  const actionLoading = updateLoading || deleteLoading || toggleLoading;

  // Handle actions
  const handleAction = React.useCallback(
    async (action: CategoryCardAction, cat: CategoryVariant) => {
      // Check for custom handlers first
      if (userConfig.customActionHandlers?.[action]) {
        userConfig.customActionHandlers[action]!(cat);
        return;
      }

      // Built-in action handlers
      switch (action) {
        case "toggle-status":
          await toggleStatus(cat._id.toString());
          break;

        case "archive":
          await updateCategory(cat._id.toString(), { isActive: false });
          break;

        case "restore":
          await updateCategory(cat._id.toString(), { isActive: true });
          break;

        case "delete":
          if (
            confirm(
              `Are you sure you want to delete "${cat.catName}"? This action cannot be undone.`
            )
          ) {
            await deleteCategory(cat._id.toString());
          }
          break;

        default:
          // For other actions, use the provided onAction callback
          onAction?.(action, cat);
          break;
      }
    },
    [
      userConfig.customActionHandlers,
      toggleStatus,
      updateCategory,
      deleteCategory,
      onAction,
    ]
  );

  if (!shouldShowCategory(category, config.context)) {
    return null;
  }

  const isDeleted = category.isDeleted;
  let statusStyle: StyleConfig = {};

  if (isDeleted && (userConfig.deletedStyle || DEFAULT_DELETED_STYLE)) {
    statusStyle = userConfig.deletedStyle || DEFAULT_DELETED_STYLE;
  } else if (
    !category.isActive &&
    (userConfig.inactiveStyle || DEFAULT_INACTIVE_STYLE)
  ) {
    statusStyle = userConfig.inactiveStyle || DEFAULT_INACTIVE_STYLE;
  }

  const cardClassName = cn(
    "transition-all cursor-pointer",
    config.viewMode === "grid" ? "h-full hover:shadow-lg" : "hover:shadow-md",
    statusStyle.cardClassName,
    (isLoading || actionLoading) && "opacity-50",
    className
  );

  const textClassName = cn(
    "font-medium text-sm truncate",
    statusStyle.textClassName
  );

  const handlePrimaryClick = () => {
    if (actionLoading || isLoading) return;
    handleAction(config.primaryAction, category);
  };

  const isActionDisabled = isLoading || actionLoading;

  const truncatedDescription =
    config.maxDescriptionLength && category.catDesc
      ? category.catDesc.length > config.maxDescriptionLength
        ? category.catDesc.substring(0, config.maxDescriptionLength) + "..."
        : category.catDesc
      : category.catDesc;

  if (config.viewMode === "grid") {
    return (
      <Card className={cardClassName}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {config.showSelection && onToggleSelection && (
                  <Input
                    type="checkbox"
                    checked={isSelected || false}
                    onChange={() => onToggleSelection(category)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4"
                    disabled={isActionDisabled}
                  />
                )}
              </div>
              <div className="flex gap-1">
                <StatusBadge category={category} config={config} />
              </div>
            </div>

            {config.showImage && (
              <CategoryImage
                category={category}
                size={{ w: 400, h: 240, class: "w-full h-40" }}
              />
            )}

            <div
              onClick={handlePrimaryClick}
              className="cursor-pointer space-y-2">
              <h3 className={cn(textClassName, "mb-1")}>{category.catName}</h3>

              {config.showDescription && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {truncatedDescription || "No description"}
                </p>
              )}

              <div className="flex items-center justify-between">
                {config.showServiceCount && (
                  <ServiceCountDisplay
                    category={category}
                    context={config.context}
                  />
                )}

                {config.showRating && averageRating && (
                  <RatingDisplay
                    rating={averageRating}
                    totalBookings={totalBookings}
                  />
                )}
              </div>
            </div>

            <GridActions
              category={category}
              config={config}
              customLabels={userConfig.customLabels}
              onAction={handleAction}
              disabled={isActionDisabled}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardContent className="p-2">
        <div className="flex items-center gap-3">
          {config.showSelection && onToggleSelection && (
            <Input
              type="checkbox"
              checked={isSelected || false}
              onChange={() => onToggleSelection(category)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 flex-shrink-0"
              disabled={isActionDisabled}
            />
          )}

          {config.showImage && (
            <CategoryImage
              category={category}
              size={{ w: 48, h: 48, class: "w-12 h-12 flex-shrink-0" }}
            />
          )}

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handlePrimaryClick}>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={textClassName}>{category.catName}</h3>
              <StatusBadge category={category} config={config} />
            </div>

            {config.showDescription && (
              <p className="text-xs text-muted-foreground truncate">
                {truncatedDescription || "No description"}
              </p>
            )}

            <div className="flex items-center gap-4 mt-1">
              {config.showServiceCount && (
                <ServiceCountDisplay
                  category={category}
                  context={config.context}
                />
              )}

              {config.showRating && averageRating && (
                <RatingDisplay
                  rating={averageRating}
                  totalBookings={totalBookings}
                />
              )}
            </div>
          </div>

          <ListActions
            category={category}
            config={config}
            customLabels={userConfig.customLabels}
            onAction={handleAction}
            disabled={isActionDisabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};
