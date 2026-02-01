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
    <div className="space-y-6 bg-background text-foreground">
      <div className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Services You Offer
        </h2>
        <p className="text-muted-foreground mt-1">
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
                Selected Services{" "}
                <span className="text-red-600 dark:text-red-400">*</span>
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Service
              </Button>
            </div>

            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                <p className="w-full text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Selected ({selectedServices.length}):
                </p>
                {selectedServices.map((serviceId) => {
                  const service = services.find((s) => s._id === serviceId);
                  return service ? (
                    <Badge
                      key={serviceId}
                      variant="secondary"
                      className="gap-2 pr-1 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {service.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(serviceId)}
                        className="ml-1 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${service.title}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <ScrollArea className="h-[400px] border border-border rounded-lg bg-background">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading services...
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No services found matching your search."
                      : "No services available."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredServices.map((service) => {
                    const isSelected = selectedServices.includes(service._id);
                    return (
                      <div
                        key={service._id}
                        className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        isSelected
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                          : "border-border hover:border-blue-400 dark:hover:border-blue-500 hover:bg-muted/50"
                      }
                    `}>
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
                            onClick={() => handleServiceToggle(service._id)}>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {service.title}
                              </h3>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-xs border-border text-muted-foreground">
                                {service.categoryId?.catName || "Uncategorized"}
                              </Badge>
                              {service.servicePricing && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-secondary text-secondary-foreground">
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

            <FormDescription className="mt-2 text-muted-foreground">
              Select at least one service that you offer. You can create custom
              services if you don't find what you're looking for.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Create Service Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-background border-border">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-foreground">
              Create New Service
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new service offering. It will be automatically added to
              your selected services once created.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto p-6">
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
