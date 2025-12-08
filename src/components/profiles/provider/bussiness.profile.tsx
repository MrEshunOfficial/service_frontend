"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Briefcase,
  Image as ImageIcon,
  Navigation,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProviderProfile, NearestProviderResult } from "@/types/provider.types";
import { LocationSectionWithMap } from "./ProviderLocationWithMap";

// ============================================
// Component Props
// ============================================

interface BusinessProfileProps {
  provider: ProviderProfile | NearestProviderResult;
  variant?: "full" | "card" | "compact";
  mode?: "public" | "owner";
  showActions?: boolean;
  showDistance?: boolean;
  onEdit?: () => void;
  handleBookService?: () => void;
  onViewServices?: () => void;
  onNavigate?: () => void;
  onDelete?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onAddService?: () => void;
  onRemoveService?: (serviceId: string) => Promise<void>;
  onManageGallery?: () => void;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

const isNearestProviderResult = (
  data: ProviderProfile | NearestProviderResult
): data is NearestProviderResult => {
  return "provider" in data && "distanceKm" in data;
};

const getProviderData = (
  data: ProviderProfile | NearestProviderResult
): ProviderProfile => {
  return isNearestProviderResult(data) ? data.provider : data;
};

const getInitials = (name?: string): string => {
  if (!name) return "BP";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatWorkingHours = (
  day: string,
  hours?: { start: string; end: string }
): string => {
  if (!hours) return "Closed";
  return `${hours.start} - ${hours.end}`;
};

const getCurrentDaySchedule = (
  workingHours?: Record<string, { start: string; end: string }>
) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = days[new Date().getDay()];
  return workingHours?.[today];
};

// ============================================
// Sub Components
// ============================================

const ContactSection: React.FC<{
  contact: ProviderProfile["providerContactInfo"];
  handleBookService?: () => void;
}> = ({ contact, handleBookService }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-teal-600" />
      <span className="text-sm">{contact.primaryContact}</span>
    </div>
    {contact.secondaryContact && (
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-gray-400" />
        <span className="text-sm">{contact.secondaryContact}</span>
      </div>
    )}
    {contact.businessEmail && (
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-teal-600" />
        <span className="text-sm">{contact.businessEmail}</span>
      </div>
    )}
  </div>
);

const AvailabilitySection: React.FC<{
  isAlwaysAvailable: boolean;
  workingHours?: Record<string, { start: string; end: string }>;
}> = ({ isAlwaysAvailable, workingHours }) => {
  const [showAllHours, setShowAllHours] = useState(false);
  const todaySchedule = getCurrentDaySchedule(workingHours);
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-teal-600" />
        {isAlwaysAvailable ? (
          <span className="text-sm font-medium text-green-600">
            Available 24/7
          </span>
        ) : todaySchedule ? (
          <div>
            <span className="text-sm font-medium">Today: </span>
            <span className="text-sm text-green-600">
              {formatWorkingHours("today", todaySchedule)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-red-600">Closed Today</span>
        )}
      </div>

      {!isAlwaysAvailable && workingHours && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllHours(!showAllHours)}
            className="text-xs p-0 h-auto hover:bg-transparent">
            {showAllHours ? "Hide" : "View"} all hours
          </Button>

          {showAllHours && (
            <div className="mt-2 space-y-1 text-xs">
              {days.map((day) => (
                <div key={day} className="flex justify-between capitalize">
                  <span className="font-medium">{day}:</span>
                  <span className="text-muted-foreground">
                    {formatWorkingHours(day, workingHours[day])}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Owner Actions Dialog Component
const OwnerActionsDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService?: () => void;
  onManageGallery?: () => void;
  onEdit?: () => void;
}> = ({ open, onOpenChange, onAddService, onManageGallery, onEdit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Profile Management</DialogTitle>
        <DialogDescription>
          Choose an action to manage your business profile
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        {onEdit && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onEdit();
              onOpenChange(false);
            }}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile Information
          </Button>
        )}
        {onAddService && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onAddService();
              onOpenChange(false);
            }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        )}
        {onManageGallery && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onManageGallery();
              onOpenChange(false);
            }}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Manage Gallery
          </Button>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

// Delete Confirmation Dialog
const DeleteConfirmationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  isDeleted?: boolean;
}> = ({ open, onOpenChange, onConfirm, loading, isDeleted }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          {isDeleted ? "Profile Already Deleted" : "Delete Business Profile?"}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {isDeleted
            ? "This profile has been deleted. You can restore it or permanently delete it."
            : "This action will soft-delete your business profile. You can restore it later if needed. Are you sure you want to continue?"}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700">
          {loading ? "Deleting..." : "Delete Profile"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Restore Confirmation Dialog
const RestoreConfirmationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}> = ({ open, onOpenChange, onConfirm, loading }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-green-500" />
          Restore Business Profile?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This will restore your business profile and make it active again. Your
          services and information will be publicly visible.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700">
          {loading ? "Restoring..." : "Restore Profile"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Service Item with Remove Action (Owner Mode)
const ServiceItemOwner: React.FC<{
  service: any;
  onRemove?: (serviceId: string) => void;
  removing?: boolean;
}> = ({ service, onRemove, removing }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {service.coverImage ? (
            <img
              src={service.coverImage.url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Briefcase className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{service.title}</h4>
          {service.servicePricing && (
            <p className="text-sm text-teal-600 font-semibold">
              GH₵ {service.servicePricing.serviceBasePrice.toFixed(2)}
            </p>
          )}
        </div>

        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={removing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Service?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{service.title}" from your
              offerings? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove?.(service._id);
                setShowConfirm(false);
              }}
              className="bg-red-600 hover:bg-red-700">
              Remove Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ============================================
// Main Component
// ============================================

export const BusinessProfile: React.FC<BusinessProfileProps> = ({
  provider,
  variant = "full",
  mode = "public",
  showActions = true,
  showDistance = true,
  onEdit,
  handleBookService,
  onViewServices,
  onDelete,
  onRestore,
  onAddService,
  onRemoveService,
  onManageGallery,
  className = "",
}) => {
  const providerData = getProviderData(provider);
  const distance = isNearestProviderResult(provider)
    ? provider.distanceKm
    : undefined;
  const distanceFormatted = isNearestProviderResult(provider)
    ? provider.distanceFormatted
    : undefined;

  // State for dialogs and actions
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(null);

  const isDeleted = providerData.isDeleted;

  const handleDelete = async () => {
    if (!onDelete) return;
    setActionLoading(true);
    try {
      await onDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete profile:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setActionLoading(true);
    try {
      await onRestore();
      setShowRestoreDialog(false);
    } catch (error) {
      console.error("Failed to restore profile:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!onRemoveService) return;
    setRemovingServiceId(serviceId);
    try {
      await onRemoveService(serviceId);
    } catch (error) {
      console.error("Failed to remove service:", error);
    } finally {
      setRemovingServiceId(null);
    }
  };

  // Compact Card Variant
  if (variant === "compact") {
    return (
      <Card className={`hover:shadow-md transition-shadow ${className} ${isDeleted ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={providerData.profile.profilePictureId?.url} />
              <AvatarFallback>
                {getInitials(providerData.businessName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {providerData.businessName || "Business Provider"}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {providerData.locationData.city},{" "}
                    {providerData.locationData.region}
                  </p>
                </div>
                {showDistance && distanceFormatted && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {distanceFormatted}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                {isDeleted && (
                  <Badge variant="destructive" className="text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Deleted
                  </Badge>
                )}
                {providerData.isCompanyTrained && (
                  <Badge variant="outline" className="text-xs">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Trained
                  </Badge>
                )}
                {providerData.isAlwaysAvailable && (
                  <Badge variant="outline" className="text-xs bg-green-50">
                    <Clock className="w-3 h-3 mr-1" />
                    24/7
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card Variant
  if (variant === "card") {
    return (
      <Card className={`hover:shadow-lg transition-shadow ${className} ${isDeleted ? 'opacity-60 border-red-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={providerData.profile.profilePictureId?.url} />
              <AvatarFallback>
                {getInitials(providerData.businessName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <CardTitle className="text-xl">
                {providerData.businessName || "Business Provider"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {providerData.locationData.city},{" "}
                {providerData.locationData.region}
              </p>
            </div>

            {showDistance && distanceFormatted && (
              <Badge variant="secondary">{distanceFormatted}</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {isDeleted && (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Profile Deleted
              </Badge>
            )}
            {providerData.isCompanyTrained && (
              <Badge variant="outline">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Company Trained
              </Badge>
            )}
            {providerData.requireInitialDeposit && (
              <Badge variant="outline">
                <DollarSign className="w-3 h-3 mr-1" />
                {providerData.percentageDeposit}% Deposit
              </Badge>
            )}
          </div>
          {mode === "public" && (
            <Button
              variant="default"
              size="sm"
              className="w-full mt-2"
              onClick={handleBookService}
              disabled={isDeleted}>
              <Phone className="w-4 h-4 mr-2" />
              Place a request
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <AvailabilitySection
            isAlwaysAvailable={providerData.isAlwaysAvailable}
            workingHours={providerData.workingHours}
          />

          <Separator />

          <ContactSection contact={providerData.providerContactInfo} />

          {showActions && mode === "owner" && (
            <div className="flex gap-2 pt-2">
              {isDeleted ? (
                <>
                  {onRestore && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowRestoreDialog(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEdit}
                      className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full Variant
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Deleted Profile Alert */}
      {isDeleted && mode === "owner" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  Profile Deleted
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  This business profile has been deleted and is no longer visible
                  to the public. You can restore it to make it active again.
                </p>
              </div>
              {onRestore && (
                <Button
                  size="sm"
                  onClick={() => setShowRestoreDialog(true)}
                  className="bg-green-600 hover:bg-green-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restore Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={providerData.profile.profilePictureId?.url} />
              <AvatarFallback className="text-2xl">
                {getInitials(providerData.businessName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {providerData.businessName || "Business Provider"}
                  </h1>
                  {providerData.profile.bio && (
                    <p className="text-muted-foreground mt-2">
                      {providerData.profile.bio}
                    </p>
                  )}
                </div>

                {mode === "owner" && !isDeleted && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowActionsDialog(true)}>
                      Manage Profile
                    </Button>
                    {onDelete && (
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {isDeleted && (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Deleted Profile
                  </Badge>
                )}
                {providerData.isCompanyTrained && (
                  <Badge variant="default" className="bg-teal-600">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Company Trained
                  </Badge>
                )}
                {providerData.requireInitialDeposit && (
                  <Badge variant="outline">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Requires {providerData.percentageDeposit}% Deposit
                  </Badge>
                )}
                {showDistance && distanceFormatted && (
                  <Badge variant="secondary">
                    <Navigation className="w-3 h-3 mr-1" />
                    {distanceFormatted} away
                  </Badge>
                )}
              </div>

              {mode === "public" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleBookService}
                  disabled={isDeleted}>
                  <Phone className="w-4 h-4 mr-2" />
                  Place a Request
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact & Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContactSection contact={providerData.providerContactInfo} />
            <Separator />
            <AvailabilitySection
              isAlwaysAvailable={providerData.isAlwaysAvailable}
              workingHours={providerData.workingHours}
            />
          </CardContent>
        </Card>

        {/* Services */}
        {providerData.serviceOfferings &&
          providerData.serviceOfferings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Services Offered
                  </div>
                  {mode === "owner" && onAddService && !isDeleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddService}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {providerData.serviceOfferings?.map((service) =>
                    mode === "owner" ? (
                      <ServiceItemOwner
                        key={service._id}
                        service={service}
                        onRemove={!isDeleted ? handleRemoveService : undefined}
                        removing={removingServiceId === service._id}
                      />
                    ) : (
                      <div
                        key={service._id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {service.coverImage ? (
                            <img
                              src={service.coverImage.url}
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Briefcase className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {service.title}
                          </h4>
                          {service.servicePricing && (
                            <p className="text-sm text-teal-600 font-semibold">
                              GH₵{" "}
                              {service.servicePricing.serviceBasePrice.toFixed(
                                2
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {mode === "public" && onViewServices && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={onViewServices}>
                    View All Services
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

        {/* Empty Services State (Owner Mode) */}
        {mode === "owner" &&
          (!providerData.serviceOfferings ||
            providerData.serviceOfferings.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No services added yet. Add your first service to start
                    receiving bookings.
                  </p>
                  {onAddService && !isDeleted && (
                    <Button onClick={onAddService} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Service
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Location - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSectionWithMap
            location={providerData.locationData}
            distance={distance}
            distanceFormatted={distanceFormatted}
            showDistance={showDistance}
            businessName={providerData.businessName}
          />
        </CardContent>
      </Card>

      {/* Gallery */}
      {providerData.BusinessGalleryImages &&
      providerData.BusinessGalleryImages.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Gallery
              </div>
              {mode === "owner" && onManageGallery && !isDeleted && (
                <Button variant="outline" size="sm" onClick={onManageGallery}>
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Gallery
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {providerData.BusinessGalleryImages.map((imageId) => (
                <div
                  key={imageId._id.toString()}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Gallery
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {mode === "owner"
                  ? "No gallery images uploaded yet. Add photos to showcase your work."
                  : "No gallery images have been uploaded yet."}
              </p>
              {mode === "owner" && onManageGallery && !isDeleted && (
                <Button onClick={onManageGallery} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Gallery Images
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <OwnerActionsDialog
        open={showActionsDialog}
        onOpenChange={setShowActionsDialog}
        onEdit={onEdit}
        onAddService={onAddService}
        onManageGallery={onManageGallery}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        loading={actionLoading}
        isDeleted={isDeleted}
      />

      <RestoreConfirmationDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        onConfirm={handleRestore}
        loading={actionLoading}
      />
    </div>
  );
};

export default BusinessProfile;