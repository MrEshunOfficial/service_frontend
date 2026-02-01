import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePublicServices } from "@/hooks/services/service.hook";
import { ProviderProfileFormData } from "./providerProfileSchema";
import type { Service } from "@/types/service.types";
import { toast } from "sonner";
import ServiceForm from "./ServiceForm";

interface ServiceSelectionStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function ServiceSelectionStep({ form }: ServiceSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { services, loading, refetch } = usePublicServices({ limit: 100 });

  const selectedServices = form.watch("serviceOfferings") || [];

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = form.getValues("serviceOfferings") || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((id) => id !== serviceId)
      : [...currentServices, serviceId];

    form.setValue("serviceOfferings", newServices, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleServiceCreated = async (newService: Service) => {
    // Auto-select the newly created service
    const currentServices = form.getValues("serviceOfferings") || [];
    form.setValue("serviceOfferings", [...currentServices, newService._id], {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Refetch services to include the new one in the list
    await refetch();

    // Close the dialog
    setShowCreateDialog(false);

    // Show success toast
    toast.success("Service created and added to your offerings!");
  };

  const handleRemoveService = (serviceId: string) => {
    handleServiceToggle(serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          Services You Offer
        </h2>
        <p className="text-slate-600 mt-1">
          Select existing services or create new ones
        </p>
      </div>

      <FormField
        control={form.control}
        name="serviceOfferings"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-between mb-4">
              <FormLabel>
                Selected Services <span className="text-red-500">*</span>
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Service
              </Button>
            </div>

            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="w-full text-sm font-medium text-blue-900 mb-2">
                  Selected ({selectedServices.length}):
                </p>
                {selectedServices.map((serviceId) => {
                  const service = services.find((s) => s._id === serviceId);
                  return service ? (
                    <Badge
                      key={serviceId}
                      variant="secondary"
                      className="gap-2 pr-1"
                    >
                      {service.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(serviceId)}
                        className="ml-1 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${service.title}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading services...
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? "No services found matching your search."
                      : "No services available."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredServices.map((service) => {
                    const isSelected = selectedServices.includes(service._id);
                    return (
                      <div
                        key={service._id}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleServiceToggle(service._id)
                              }
                            />
                          </div>
                          <div
                            className="flex-1"
                            onClick={() => handleServiceToggle(service._id)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">
                                {service.title}
                              </h3>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {service.categoryId?.catName || "Uncategorized"}
                              </Badge>
                              {service.servicePricing && (
                                <Badge variant="secondary" className="text-xs">
                                  From GH₵{" "}
                                  {service.servicePricing.serviceBasePrice}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <FormDescription className="mt-2">
              Select at least one service that you offer. You can create custom
              services if you don't find what you're looking for.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Create Service Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering. It will be automatically added to
              your selected services once created.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <ServiceForm
              mode="create"
              onSuccess={handleServiceCreated}
              onCancel={() => setShowCreateDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
