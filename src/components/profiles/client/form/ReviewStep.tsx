import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  Bell,
  Shield,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export function ReviewStep() {
  const form = useFormContext();
  const formData = form.getValues();

  const renderField = (label: string, value: any, icon: React.ReactNode) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-sm">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">
          Review Your Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review your details before creating your profile.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField(
              "Preferred Name",
              formData.preferredName,
              <User className="h-4 w-4" />,
            )}

            {formData.dateOfBirth &&
              renderField(
                "Date of Birth",
                format(new Date(formData.dateOfBirth), "PPP"),
                <Calendar className="h-4 w-4" />,
              )}

            {formData.clientContactInfo?.secondaryContact && (
              <>
                <Separator />
                {renderField(
                  "Secondary Phone",
                  formData.clientContactInfo.secondaryContact,
                  <Phone className="h-4 w-4" />,
                )}
              </>
            )}

            {formData.clientContactInfo?.emailAddress &&
              renderField(
                "Email Address",
                formData.clientContactInfo.emailAddress,
                <Mail className="h-4 w-4" />,
              )}
          </CardContent>
        </Card>

        {/* Location */}
        {formData.savedAddresses?.[0] && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField(
                "GPS Address",
                formData.savedAddresses[0].ghanaPostGPS,
                <MapPin className="h-4 w-4" />,
              )}

              {formData.savedAddresses[0].nearbyLandmark &&
                renderField(
                  "Nearby Landmark",
                  formData.savedAddresses[0].nearbyLandmark,
                  <MapPin className="h-4 w-4" />,
                )}

              {(formData.savedAddresses[0].region ||
                formData.savedAddresses[0].city) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {formData.savedAddresses[0].region && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Region
                        </p>
                        <p className="font-medium">
                          {formData.savedAddresses[0].region}
                        </p>
                      </div>
                    )}
                    {formData.savedAddresses[0].city && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          City
                        </p>
                        <p className="font-medium">
                          {formData.savedAddresses[0].city}
                        </p>
                      </div>
                    )}
                    {formData.savedAddresses[0].district && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          District
                        </p>
                        <p className="font-medium">
                          {formData.savedAddresses[0].district}
                        </p>
                      </div>
                    )}
                    {formData.savedAddresses[0].locality && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Locality
                        </p>
                        <p className="font-medium">
                          {formData.savedAddresses[0].locality}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        {(formData.preferences?.languagePreference ||
          formData.preferences?.preferredCategories?.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.preferences?.languagePreference &&
                renderField(
                  "Language",
                  formData.preferences.languagePreference.toUpperCase(),
                  <Globe className="h-4 w-4" />,
                )}

              {formData.preferences?.preferredCategories?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Preferred Service Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.preferredCategories.map(
                      (category: string) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Notifications
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Email Notifications</span>
                    {formData.preferences?.communicationPreferences
                      ?.emailNotifications ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">Off</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>SMS Notifications</span>
                    {formData.preferences?.communicationPreferences
                      ?.smsNotifications ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">Off</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Push Notifications</span>
                    {formData.preferences?.communicationPreferences
                      ?.pushNotifications ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">Off</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {formData.emergencyContact?.name && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField(
                "Name",
                formData.emergencyContact.name,
                <User className="h-4 w-4" />,
              )}

              {formData.emergencyContact.relationship &&
                renderField(
                  "Relationship",
                  formData.emergencyContact.relationship
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                  <Users className="h-4 w-4" />,
                )}

              {formData.emergencyContact.phoneNumber &&
                renderField(
                  "Phone Number",
                  formData.emergencyContact.phoneNumber,
                  <Phone className="h-4 w-4" />,
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
