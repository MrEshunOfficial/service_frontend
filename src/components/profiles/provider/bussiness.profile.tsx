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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProviderProfile, NearestProviderResult } from "@/types/provider.types";

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
  onContact?: () => void;
  onViewServices?: () => void;
  onNavigate?: () => void;
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

// Helper to safely render service information
const getServiceDisplay = (service: any): { key: string; label: string } => {
  if (typeof service === "string") {
    return { key: service, label: service };
  }
  if (typeof service === "object" && service !== null) {
    return {
      key: service._id || service.id || JSON.stringify(service),
      label: service.title || service.name || service._id || "Unknown Service",
    };
  }
  return { key: String(service), label: String(service) };
};

// ============================================
// Sub Components
// ============================================

const LocationSection: React.FC<{
  location: ProviderProfile["locationData"];
  distance?: number;
  distanceFormatted?: string;
  showDistance?: boolean;
  onNavigate?: () => void;
}> = ({ location, distance, distanceFormatted, showDistance, onNavigate }) => (
  <div className="space-y-2">
    <div className="flex items-start gap-2">
      <MapPin className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-sm">
          {location.ghanaPostGPS}
          {location.isAddressVerified && (
            <ShieldCheck className="w-3 h-3 inline ml-1 text-green-600" />
          )}
        </p>
        {location.nearbyLandmark && (
          <p className="text-sm text-muted-foreground">
            {location.nearbyLandmark}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {[location.city, location.region].filter(Boolean).join(", ")}
        </p>
      </div>
    </div>

    {showDistance && distanceFormatted && (
      <div className="flex items-center gap-2 pl-6">
        <Navigation className="w-3 h-3 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">
          {distanceFormatted} away
        </span>
      </div>
    )}

    {onNavigate && (
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={onNavigate}
      >
        <Navigation className="w-4 h-4 mr-2" />
        Get Directions
      </Button>
    )}
  </div>
);

const ContactSection: React.FC<{
  contact: ProviderProfile["providerContactInfo"];
  onContact?: () => void;
}> = ({ contact, onContact }) => (
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
    {onContact && (
      <Button
        variant="default"
        size="sm"
        className="w-full mt-2"
        onClick={onContact}
      >
        <Phone className="w-4 h-4 mr-2" />
        Contact Provider
      </Button>
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
            className="text-xs p-0 h-auto hover:bg-transparent"
          >
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
  onContact,
  onViewServices,
  onNavigate,
  className = "",
}) => {
  const providerData = getProviderData(provider);
  const distance = isNearestProviderResult(provider)
    ? provider.distanceKm
    : undefined;
  const distanceFormatted = isNearestProviderResult(provider)
    ? provider.distanceFormatted
    : undefined;

  // Compact Card Variant
  if (variant === "compact") {
    return (
      <Card className={`hover:shadow-md transition-shadow ${className}`}>
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
      <Card className={`hover:shadow-lg transition-shadow ${className}`}>
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
        </CardHeader>

        <CardContent className="space-y-4">
          <AvailabilitySection
            isAlwaysAvailable={providerData.isAlwaysAvailable}
            workingHours={providerData.workingHours}
          />

          <Separator />

          <ContactSection
            contact={providerData.providerContactInfo}
            onContact={onContact}
          />

          {showActions && (
            <div className="flex gap-2 pt-2">
              {mode === "owner" && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1"
                >
                  Edit Profile
                </Button>
              )}
              {mode === "public" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onViewServices}
                  className="flex-1"
                >
                  View Services
                </Button>
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

                {mode === "owner" && onEdit && (
                  <Button variant="outline" onClick={onEdit}>
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
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
            <ContactSection
              contact={providerData.providerContactInfo}
              onContact={onContact}
            />
            <Separator />
            <AvailabilitySection
              isAlwaysAvailable={providerData.isAlwaysAvailable}
              workingHours={providerData.workingHours}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSection
              location={providerData.locationData}
              distance={distance}
              distanceFormatted={distanceFormatted}
              showDistance={showDistance}
              onNavigate={onNavigate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      {mode === "public" &&
        providerData.serviceOfferings &&
        providerData.serviceOfferings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Services Offered
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {providerData.serviceOfferings.map((service) => {
                  const { key, label } = getServiceDisplay(service);
                  return (
                    <Badge key={key} variant="outline">
                      {label}
                    </Badge>
                  );
                })}
              </div>

              {onViewServices && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={onViewServices}
                >
                  View All Services
                </Button>
              )}
            </CardContent>
          </Card>
        )}

      {/* Gallery */}
      {providerData.BusinessGalleryImages &&
      providerData.BusinessGalleryImages.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Gallery
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {providerData.BusinessGalleryImages.map((imageId) => (
                <div
                  key={imageId}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
                >
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
              <p className="text-sm text-muted-foreground">
                No gallery images have been uploaded yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessProfile;
