import React, { useMemo } from "react";
import { useProviderForm } from "../ProviderFormContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Edit,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { FormStep } from "../ProviderFormContext";
import { useServiceById } from "@/hooks/services/service.hook";

const ReviewStep: React.FC = () => {
  const { form, setCurrentStep } = useProviderForm();
  const formData = form.watch();

  // Navigate to specific step for editing
  const handleEdit = (step: FormStep) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Review Your Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please review all the information before submitting your provider
          profile. You can edit any section by clicking the edit button.
        </p>
      </div>

      {/* Success Message */}
      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
        <div className="flex gap-3">
          <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-teal-900 dark:text-teal-100">
            <p className="font-medium mb-1">You're almost done!</p>
            <p className="text-teal-800 dark:text-teal-200">
              Review your information below and click "Create Profile" or
              "Update Profile" to submit.
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base">Business Information</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(FormStep.BUSINESS_INFO)}
              className="flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Business Name</p>
            <p className="font-medium">
              {formData.businessName || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Company Trained</p>
            <Badge
              variant={formData.isCompanyTrained ? "default" : "secondary"}>
              {formData.isCompanyTrained ? "Yes" : "No"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Availability</p>
            <Badge
              variant={formData.isAlwaysAvailable ? "default" : "secondary"}>
              {formData.isAlwaysAvailable
                ? "Always Available"
                : "Scheduled Hours"}
            </Badge>
          </div>
          {!formData.isAlwaysAvailable && formData.workingHours && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Working Hours</p>
              <div className="space-y-1">
                {Object.entries(formData.workingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                    <span className="font-medium capitalize">{day}</span>
                    <span className="text-gray-600">
                      {hours.start} - {hours.end}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Initial Deposit Required</p>
            <Badge
              variant={
                formData.requireInitialDeposit ? "default" : "secondary"
              }>
              {formData.requireInitialDeposit ? "Yes" : "No"}
            </Badge>
            {formData.requireInitialDeposit && formData.percentageDeposit && (
              <span className="ml-2 text-sm text-gray-600">
                ({formData.percentageDeposit}%)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base">Contact Information</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(FormStep.BUSINESS_INFO)}
              className="flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Primary Contact</p>
            <p className="font-medium">
              {formData.providerContactInfo?.primaryContact || "Not provided"}
            </p>
          </div>
          {formData.providerContactInfo?.secondaryContact && (
            <div>
              <p className="text-sm text-gray-500">Secondary Contact</p>
              <p className="font-medium">
                {formData.providerContactInfo.secondaryContact}
              </p>
            </div>
          )}
          {formData.providerContactInfo?.businessContact && (
            <div>
              <p className="text-sm text-gray-500">Business Contact</p>
              <p className="font-medium">
                {formData.providerContactInfo.businessContact}
              </p>
            </div>
          )}
          {formData.providerContactInfo?.businessEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <p className="font-medium">
                {formData.providerContactInfo.businessEmail}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base">
                Service Offerings ({formData.serviceOfferings?.length || 0})
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(FormStep.SERVICES)}
              className="flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.serviceOfferings && formData.serviceOfferings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.serviceOfferings.map((serviceId) => (
                <ServiceCard key={serviceId} serviceId={serviceId} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No services selected</p>
          )}
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base">Location Information</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(FormStep.LOCATION)}
              className="flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Ghana Post GPS Address</p>
            <p className="font-medium">
              {formData.locationData?.ghanaPostGPS || "Not provided"}
            </p>
          </div>
          {formData.locationData?.nearbyLandmark && (
            <div>
              <p className="text-sm text-gray-500">Nearby Landmark</p>
              <p className="font-medium">
                {formData.locationData.nearbyLandmark}
              </p>
            </div>
          )}
          {formData.locationData?.gpsCoordinates && (
            <div>
              <p className="text-sm text-gray-500 mb-2">GPS Coordinates</p>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Latitude</p>
                  <p className="font-mono text-sm font-medium">
                    {formData.locationData.gpsCoordinates.latitude?.toFixed(6)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Longitude</p>
                  <p className="font-mono text-sm font-medium">
                    {formData.locationData.gpsCoordinates.longitude?.toFixed(6)}
                    °
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Reminder */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Before you submit:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Double-check all contact information is correct</li>
              <li>Ensure your location details are accurate</li>
              <li>Verify you've selected all services you can provide</li>
              <li>Review your availability and working hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Service Card Component to display service details
const ServiceCard: React.FC<{ serviceId: string }> = ({ serviceId }) => {
  const { data: service, loading, error } = useServiceById(serviceId);

  if (loading) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !service) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
        <CardContent className="p-4">
          <p className="text-sm text-red-600">
            Service not found (ID: {serviceId.substring(0, 8)}...)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{service.title}</h4>
            <Badge variant="outline" className="text-xs">
              {service.isPrivate ? "Private" : "Public"}
            </Badge>
          </div>
          {service.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {service.description}
            </p>
          )}
          {service.category && (
            <Badge variant="secondary" className="text-xs">
              {typeof service.category === "string"
                ? service.category
                : service.category.catName}
            </Badge>
          )}
          {service.servicePricing && (
            <p className="text-sm font-medium text-teal-600">
              {service.servicePricing.currency}{" "}
              {service.servicePricing.serviceBasePrice}{" "}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStep;
