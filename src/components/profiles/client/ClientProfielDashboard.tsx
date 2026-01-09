// components/client/ClientProfileDisplay.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  CreditCard,
  Bell,
  Globe,
  AlertCircle,
  CheckCircle2,
  Edit,
  Package,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressManagement } from "./AddressManagement";
import { EmergencyContactDialog } from "./EmergencyContactDialog";
import { FavoritesPopover } from "./FavoritesPopover";
import { IdDetailsDialog } from "./IdDetailsDialog";
import { PaymentMethodDialog } from "./PaymentMethodDialog";
import { PreferredCategoriesDialog } from "./PreferredCategoriesDialog";
import { CompleteClientProfile } from "@/types/profiles/client.profile.types";

interface ClientProfileDisplayProps {
  profile: CompleteClientProfile;
  onEdit?: () => void;
  showStats?: boolean;
  onUpdateProfile?: (data: any) => Promise<void>;
  onRemoveFavoriteService?: (serviceId: string) => Promise<void>;
  onRemoveFavoriteProvider?: (providerId: string) => Promise<void>;
  onAddAddress?: (address: any) => Promise<void>;
  onRemoveAddress?: (index: number) => Promise<void>;
  onSetDefaultAddress?: (index: number) => Promise<void>;
  onUpdateIdDetails?: (data: any) => Promise<void>;
  onUpdateEmergencyContact?: (data: any) => Promise<void>;
}

export function ClientProfileDisplay({
  profile,
  onEdit,
  showStats = true,
  onUpdateProfile,
  onRemoveFavoriteService,
  onRemoveFavoriteProvider,
  onAddAddress,
  onRemoveAddress,
  onSetDefaultAddress,
  onUpdateIdDetails,
  onUpdateEmergencyContact,
}: ClientProfileDisplayProps) {
  const router = useRouter();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [isIdDetailsDialogOpen, setIsIdDetailsDialogOpen] = useState(false);
  const [isEmergencyContactDialogOpen, setIsEmergencyContactDialogOpen] =
    useState(false);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "CL";
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  if (!profile?.client) {
    return (
      <Card className="bg-transparent">
        {" "}
        {/* Added bg-transparent */}
        <CardContent className="py-8 text-center text-muted-foreground">
          No profile data available
        </CardContent>
      </Card>
    );
  }

  const { client, stats } = profile;

  const verificationStatus = stats?.verificationStatus || {
    phoneVerified: false,
    emailVerified: false,
    idVerified: false,
    overallVerified: false,
  };

  const verificationLevel =
    verificationStatus.phoneVerified &&
    verificationStatus.emailVerified &&
    verificationStatus.idVerified
      ? "Fully Verified"
      : verificationStatus.phoneVerified || verificationStatus.emailVerified
      ? "Partially Verified"
      : "Unverified";

  const normalizedIdDetails = client.idDetails
    ? {
        ...client.idDetails,
        fileImage: client.idDetails.fileImage?.map((img) => img._id) ?? [],
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-transparent">
        {" "}
        {/* Added bg-transparent */}
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={client.profile?.profilePictureId?.url}
                  alt={client.preferredName || client.profile?.userId?.email}
                />
                <AvatarFallback className="text-3xl font-semibold bg-linear-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(
                    client.preferredName,
                    client.profile?.userId?.email
                  )}
                </AvatarFallback>
              </Avatar>

              <Badge
                variant={
                  verificationLevel === "Fully Verified"
                    ? "default"
                    : verificationLevel === "Partially Verified"
                    ? "secondary"
                    : "outline"
                }
                className="flex items-center gap-1">
                {verificationLevel === "Fully Verified" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {verificationLevel}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {client.preferredName ||
                      client.profile?.userId?.email ||
                      "Client"}
                  </h2>
                  <p className="text-muted-foreground">
                    {client.profile?.bio || "No bio provided"}
                  </p>
                </div>
                {onEdit && (
                  <Button onClick={onEdit} size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {client.profile?.userId?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {client.profile.userId.email}
                    </span>
                  </div>
                )}

                {client.profile?.mobileNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {client.profile.mobileNumber}
                    </span>
                  </div>
                )}

                {client.clientContactInfo?.secondaryContact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Secondary:</span>
                    <span className="font-medium">
                      {client.clientContactInfo.secondaryContact}
                    </span>
                  </div>
                )}

                {client.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatDate(client.dateOfBirth)}
                    </span>
                  </div>
                )}
              </div>

              {client.profile?.createdAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Member since {formatDate(client.profile.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-transparent">
            {" "}
            {/* Added bg-transparent */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBookings ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            {" "}
            {/* Added bg-transparent */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Addresses
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSavedAddresses ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered locations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            {" "}
            {/* Added bg-transparent */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Payment Methods
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPaymentMethods ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Saved payment options
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors bg-transparent">
            {" "}
            {/* Added bg-transparent */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <FavoritesPopover
                favoriteServices={client.favoriteServices || []}
                favoriteProviders={client.favoriteProviders || []}
                onRemoveService={onRemoveFavoriteService}
                onRemoveProvider={onRemoveFavoriteProvider}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalFavoriteServices ?? 0) +
                  (stats.totalFavoriteProviders ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalFavoriteServices ?? 0} services,{" "}
                {stats.totalFavoriteProviders ?? 0} providers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Details */}
        <Card className="bg-transparent">
          {" "}
          {/* Added bg-transparent */}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Status
                </CardTitle>
                <CardDescription>
                  Your account verification details
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsIdDetailsDialogOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                {verificationStatus.phoneVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email Address</span>
                </div>
                {verificationStatus.emailVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ID Document</span>
                </div>
                {verificationStatus.idVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>

              {/* ID Details */}
              {client.idDetails && (
                <Card className="w-full mt-3 bg-transparent">
                  {" "}
                  {/* Added bg-transparent to nested Card */}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Identification Details
                    </CardTitle>
                    <CardDescription>
                      Your verified ID information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          ID Type
                        </p>
                        <Badge variant="secondary" className="text-sm">
                          {client.idDetails.idType
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          ID Number
                        </p>
                        <p className="text-sm font-mono font-medium">
                          {client.idDetails.idNumber}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <AddressManagement
          addresses={client.savedAddresses || []}
          defaultAddressIndex={client.defaultAddressIndex}
          onAddAddress={onAddAddress}
          onRemoveAddress={onRemoveAddress}
          onSetDefaultAddress={onSetDefaultAddress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferences */}
        <Card className="bg-transparent">
          {" "}
          {/* Added bg-transparent */}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Your notification and language settings
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">
                Communication Preferences
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <Badge
                    variant={
                      client.preferences?.communicationPreferences
                        ?.emailNotifications
                        ? "default"
                        : "outline"
                    }>
                    {client.preferences?.communicationPreferences
                      ?.emailNotifications
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Notifications</span>
                  <Badge
                    variant={
                      client.preferences?.communicationPreferences
                        ?.smsNotifications
                        ? "default"
                        : "outline"
                    }>
                    {client.preferences?.communicationPreferences
                      ?.smsNotifications
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <Badge
                    variant={
                      client.preferences?.communicationPreferences
                        ?.pushNotifications
                        ? "default"
                        : "outline"
                    }>
                    {client.preferences?.communicationPreferences
                      ?.pushNotifications
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
            {client.preferences?.languagePreference && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Language</span>
                </div>
                <Badge variant="secondary">
                  {client.preferences.languagePreference.toUpperCase()}
                </Badge>
              </div>
            )}
            {client.preferences?.preferredCategories &&
              client.preferences.preferredCategories.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">
                      Preferred Categories
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCategoriesDialogOpen(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {client.preferences.preferredCategories.map(
                      (category: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            {(!client.preferences?.preferredCategories ||
              client.preferences.preferredCategories.length === 0) && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Preferred Categories</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCategoriesDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  No preferred categories set
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Payment Methods */}
          <Card className="bg-transparent">
            {" "}
            {/* Added bg-transparent */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Your saved payment options</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaymentDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {client.savedPaymentMethods &&
              client.savedPaymentMethods.length > 0 ? (
                <div className="space-y-2">
                  {client.savedPaymentMethods.map(
                    (method: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {method.label || method.type}
                            </p>
                            {method.provider && (
                              <p className="text-xs text-muted-foreground">
                                {method.provider}
                              </p>
                            )}
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payment methods saved
                </p>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-transparent">
            {" "}
            {/* Added bg-transparent */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>In case of emergency</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEmergencyContactDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {client.emergencyContact ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {client.emergencyContact.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {client.emergencyContact.relationship}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {client.emergencyContact.phoneNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No emergency contact added
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <PaymentMethodDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        currentMethods={client.savedPaymentMethods || []}
        onSave={onUpdateProfile}
      />

      <PreferredCategoriesDialog
        open={isCategoriesDialogOpen}
        onOpenChange={setIsCategoriesDialogOpen}
        currentCategories={client.preferences?.preferredCategories || []}
        onSave={onUpdateProfile}
      />

      <IdDetailsDialog
        open={isIdDetailsDialogOpen}
        onOpenChange={setIsIdDetailsDialogOpen}
        currentIdDetails={normalizedIdDetails}
        onSave={onUpdateIdDetails}
      />

      <EmergencyContactDialog
        open={isEmergencyContactDialogOpen}
        onOpenChange={setIsEmergencyContactDialogOpen}
        currentContact={client.emergencyContact}
        onSave={onUpdateEmergencyContact}
      />
    </div>
  );
}

export default ClientProfileDisplay;
