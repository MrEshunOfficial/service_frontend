// components/services/ServiceCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Share2,
  Heart,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  Package,
  Camera,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/types/service.types";
import { ImageUploadPopover } from "../filemanager/EntityImageUpload";

interface ServiceCardProps {
  service: Service;
  variant?: "public" | "user";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onShare?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onImageUpdate?: (serviceId: string, newImageUrl: string) => void;
  isFavorite?: boolean;
}

interface MenuItem {
  icon: typeof Eye;
  label: string;
  onClick?: () => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  variant = "public",
  onEdit,
  onDelete,
  onView,
  onShare,
  onToggleFavorite,
  onImageUpdate,
  isFavorite = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: service.servicePricing?.currency || "USD",
    }).format(price);
  };

  const handleImageUploadSuccess = (url: string) => {
    if (onImageUpdate) {
      onImageUpdate(service._id, url);
    }
  };

  const menuItems: Record<typeof variant, MenuItem[]> = {
    public: [
      {
        icon: Eye,
        label: "View Details",
        onClick: () => onView?.(service._id),
      },
      {
        icon: Share2,
        label: "Share link",
        onClick: () => onShare?.(service._id),
      },
    ],
    user: [
      {
        icon: Eye,
        label: "View Details",
        onClick: () => onView?.(service._id),
      },
      { icon: Edit, label: "Edit", onClick: () => onEdit?.(service._id) },
      {
        icon: Trash2,
        label: "Delete",
        onClick: () => onDelete?.(service._id),
        className:
          "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950",
      },
      {
        icon: Share2,
        label: "Share link",
        onClick: () => onShare?.(service._id),
      },
    ],
  };

  return (
    <Card className="group h-96 w-full max-w-xs overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-0 gap-0">
      {/* Image Header with Gradient Overlay */}
      <CardHeader className="h-32 p-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent z-10" />

        {service.coverImage?.thumbnailUrl ? (
          <Image
            src={service.coverImage.thumbnailUrl}
            alt={service.coverImage.fileName || service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Package className="w-20 h-20 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No Image Available</p>
            </div>
          </div>
        )}

        {/* Top Overlay Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
          {/* Left side: Favorite (public) or Upload (user) */}
          <div>
            {variant === "public" && onToggleFavorite && (
              <Button
                onClick={() => onToggleFavorite(service._id)}
                variant="ghost"
                size="icon"
                className="bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm rounded-full h-10 w-10 shadow-lg hover:scale-110 transition-transform"
              >
                <Heart
                  size={20}
                  className={
                    isFavorite
                      ? "fill-red-500 text-red-500 animate-pulse"
                      : "text-gray-700 dark:text-gray-300"
                  }
                />
              </Button>
            )}

            {variant === "user" && (
              <ImageUploadPopover
                type="service"
                entityId={service._id}
                currentImageUrl={service.coverImage?.url}
                onUploadSuccess={handleImageUploadSuccess}
                trigger={
                  <div className="bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm rounded-full h-10 w-10 shadow-lg hover:scale-110 transition-transform flex items-center justify-center cursor-pointer">
                    <Camera
                      size={20}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </div>
                }
              />
            )}
          </div>
        </div>

        {/* Category Badge at Bottom */}
        {service.categoryId && (
          <div className="absolute bottom-4 left-4 z-20">
            <Badge className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-lg backdrop-blur-sm px-3 py-1">
              <Package size={12} className="mr-1" />
              {service.categoryId.catName}
            </Badge>
          </div>
        )}
      </CardHeader>

      {/* Content Section */}
      <CardContent className="p-2 space-y-2">
        {/* Title */}
        <div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {service.title}
          </h3>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-linear-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                +{service.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Pricing Section */}
        {service.servicePricing && (
          <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign
                    size={18}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Service Fee
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(service.servicePricing.serviceBasePrice)}
                </p>
              </div>
            </div>

            {/* Additional Fees Info - Only show in user variant */}
            {variant === "user" && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-1.5">
                  <MapPin
                    size={14}
                    className={
                      service.servicePricing.includeTravelFee
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400"
                    }
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {service.servicePricing.includeTravelFee
                      ? "Travel incl."
                      : "Travel extra"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package
                    size={14}
                    className={
                      service.servicePricing.includeAdditionalFees
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400"
                    }
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {service.servicePricing.includeAdditionalFees
                      ? "Fees incl."
                      : "Fees extra"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Active Status - Only show in user variant */}
          {variant === "user" && service.isActive !== undefined && (
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  service.isActive
                    ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            </div>
          )}

          {/* Relative Time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={13} />
            <span>
              {formatDistanceToNow(new Date(service.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Actions - Different UI for public vs user */}
        {variant === "public" ? (
          <div className="flex items-center gap-2">
            {/* View Details Button */}
            <Button
              onClick={() => onView?.(service._id)}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm h-8 px-4 rounded-lg text-xs font-medium"
            >
              Request a Provider
            </Button>

            {/* Share Icon with Tooltip */}
            {onShare && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onShare(service._id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Share2
                        size={16}
                        className="text-gray-600 dark:text-gray-300"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : (
          /* Actions Menu for user variant */
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreVertical
                  size={18}
                  className="text-gray-600 dark:text-gray-300"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-52 p-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl rounded-xl"
              align="end"
            >
              {menuItems[variant].map((item, index) => (
                <Button
                  key={index}
                  onClick={item.onClick}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start gap-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-2.5 ${
                    item.className || ""
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
