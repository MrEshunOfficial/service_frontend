import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { useProviderForm } from "../ProviderFormContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePublicServices } from "@/hooks/services/service.hook";

const ServicesStep: React.FC = () => {
  const router = useRouter();

  // Use the custom provider form hook instead of useFormContext
  const { form } = useProviderForm();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedServices = watch("serviceOfferings") || [];

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Fetch public services
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    refetch,
  } = usePublicServices({
    page: 1,
    limit: 100, // Get more services for selection
    categoryId: categoryFilter || undefined,
  });

  // Filter services based on search
  const filteredServices = React.useMemo(() => {
    if (!services) return [];
    return services.filter((service) => {
      const matchesSearch =
        !searchQuery ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [services, searchQuery]);

  // Handle service selection toggle
  const handleServiceToggle = (serviceId: string) => {
    const currentServices = selectedServices || [];
    const isSelected = currentServices.includes(serviceId);

    if (isSelected) {
      setValue(
        "serviceOfferings",
        currentServices.filter((id) => id !== serviceId),
        { shouldValidate: true }
      );
    } else {
      setValue("serviceOfferings", [...currentServices, serviceId], {
        shouldValidate: true,
      });
    }
  };

  // Handle remove service
  const handleRemoveService = (serviceId: string) => {
    const currentServices = selectedServices || [];
    setValue(
      "serviceOfferings",
      currentServices.filter((id) => id !== serviceId),
      { shouldValidate: true }
    );
  };

  // Navigate to create service page
  const handleCreateNewService = () => {
    // Save current form state before navigating
    const currentFormData = watch();
    sessionStorage.setItem(
      "pendingProviderForm",
      JSON.stringify(currentFormData)
    );
    sessionStorage.setItem("returnToProviderForm", "true");

    // Navigate to service creation
    router.push("/service-offered/create?returnTo=provider-form");
  };

  // Check if returning from service creation
  useEffect(() => {
    const returnFlag = sessionStorage.getItem("returnToProviderForm");
    const newServiceId = sessionStorage.getItem("newlyCreatedServiceId");

    if (returnFlag === "true" && newServiceId) {
      // Add the newly created service to selections
      const currentServices = selectedServices || [];
      if (!currentServices.includes(newServiceId)) {
        setValue("serviceOfferings", [...currentServices, newServiceId], {
          shouldValidate: true,
        });
      }

      // Clean up session storage
      sessionStorage.removeItem("returnToProviderForm");
      sessionStorage.removeItem("newlyCreatedServiceId");

      // Refetch services to include the new one
      refetch();
    }
  }, [selectedServices, setValue, refetch]);

  // Get selected service details
  const selectedServiceDetails = React.useMemo(() => {
    if (!services || !selectedServices) return [];
    return services.filter((service) => selectedServices.includes(service._id));
  }, [services, selectedServices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Your Services
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose the services you provide. You can select from existing services
          or create new ones.
        </p>
      </div>

      {/* Selected Services Summary */}
      {selectedServices && selectedServices.length > 0 && (
        <Card className="border-teal-200 bg-teal-50 dark:bg-teal-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              Selected Services ({selectedServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedServiceDetails.map((service) => (
                <Badge
                  key={service._id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  {service.title}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service._id)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errors.serviceOfferings && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.serviceOfferings.message}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleCreateNewService}
            className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Service
          </Button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Available Services</Label>

        {servicesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <span className="ml-3 text-gray-600">Loading services...</span>
          </div>
        ) : servicesError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load services. Please try again.
            </AlertDescription>
          </Alert>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {searchQuery
                  ? "No services found matching your search."
                  : "No services available. Create a new service to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Controller
            name="serviceOfferings"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices?.includes(service._id);

                  return (
                    <Card
                      key={service._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-teal-500 border-2 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleServiceToggle(service._id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleServiceToggle(service._id)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {service.title}
                                </h4>
                                {service.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                              )}
                            </div>

                            {/* Service Category */}
                            {service.categoryId && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {typeof service.categoryId === "string"
                                    ? service.categoryId
                                    : service.categoryId.catName}
                                </Badge>
                              </div>
                            )}

                            {/* Service Type */}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge
                                variant={
                                  service.isPrivate ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {service.isPrivate ? "Private" : "Public"}
                              </Badge>
                              {service.servicePricing && (
                                <span className="text-sm text-gray-600">
                                  {service.servicePricing.currency}{" "}
                                  {service.servicePricing.serviceBasePrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          />
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Tips for selecting services:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Select all services you can provide professionally</li>
              <li>
                Don't see your service? Click "Create New Service" to add it
              </li>
              <li>You can update your services anytime after registration</li>
              <li>
                Make sure you have the capacity to deliver the selected services
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesStep;
