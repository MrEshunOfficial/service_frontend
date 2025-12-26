"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  Check,
  ChevronsUpDown,
  CheckCircle,
} from "lucide-react";
import {
  useCreateService,
  useUpdateService,
} from "@/hooks/services/service.hook";
import type {
  CreateServiceData,
  UpdateServiceData,
} from "@/lib/api/services/service.api";
import { useActiveCategories } from "@/hooks/services/services.category.hook";
import { useAuth } from "@/hooks/auth/useAuth";
import { SystemRole } from "@/types/base.types";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Service } from "@/types/service.types";
import { cn } from "@/lib/utils/utils";

interface ServiceFormData {
  title: string;
  description: string;
  tags: string;
  categoryId: string;
  coverImage?: string;
  serviceBasePrice: string;
  includeTravelFee: boolean;
  includeAdditionalFees: boolean;
  currency: string;
  isPrivate: boolean;
}

interface ServiceFormProps {
  mode: "create" | "edit";
  service?: Service;
  onSuccess?: (service: Service) => void;
  onCancel?: () => void;
}

export default function ServiceForm({
  mode = "create",
  service,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const router = useRouter();
  const { createService, loading: createLoading } = useCreateService();
  const { updateService, loading: updateLoading } = useUpdateService();
  const { user } = useAuth();

  const loading = mode === "create" ? createLoading : updateLoading;

  // Fetch categories using the hook
  const {
    data: categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useActiveCategories();

  console.log("available categories: ", categories);

  // Category popover state
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  // Initialize form data from service prop if in edit mode
  const getInitialFormData = (): ServiceFormData => {
    if (mode === "edit" && service) {
      return {
        title: service.title || "",
        description: service.description || "",
        tags: service.tags?.join(", ") || "",
        categoryId:
          typeof service.categoryId === "string"
            ? service.categoryId
            : service.categoryId?._id || "",
        coverImage: service.coverImage?._id,
        serviceBasePrice:
          service.servicePricing?.serviceBasePrice?.toString() || "",
        includeTravelFee: service.servicePricing?.includeTravelFee || false,
        includeAdditionalFees:
          service.servicePricing?.includeAdditionalFees || false,
        currency: service.servicePricing?.currency || "GHS",
        isPrivate: service.isPrivate || false,
      };
    }

    return {
      title: "",
      description: "",
      tags: "",
      categoryId: "",
      coverImage: undefined,
      serviceBasePrice: "",
      includeTravelFee: false,
      includeAdditionalFees: false,
      currency: "GHS",
      isPrivate: false,
    };
  };

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>(
    getInitialFormData()
  );

  // Update form data when service prop changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && service) {
      setFormData(getInitialFormData());
    }
  }, [service, mode]);

  // UI state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, categoryId }));
    setCategoryPopoverOpen(false);

    // Clear validation error for category
    if (validationErrors.categoryId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categoryId;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Service title is required";
    } else if (formData.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 20) {
      errors.description = "Description must be at least 20 characters";
    } else if (formData.description.length > 5000) {
      errors.description = "Description must be less than 5000 characters";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Please select a category";
    }

    if (formData.serviceBasePrice) {
      const price = parseFloat(formData.serviceBasePrice);
      if (isNaN(price) || price < 0) {
        errors.serviceBasePrice = "Please enter a valid price";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Parse tags
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Prepare service data
      const serviceData: CreateServiceData | UpdateServiceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: tagsArray,
        categoryId: formData.categoryId,
        coverImage: formData.coverImage,
        isPrivate: formData.isPrivate,
      };

      // Add pricing if provided
      if (formData.serviceBasePrice) {
        serviceData.servicePricing = {
          serviceBasePrice: parseFloat(formData.serviceBasePrice),
          includeTravelFee: formData.includeTravelFee,
          includeAdditionalFees: formData.includeAdditionalFees,
          currency: formData.currency,
          platformCommissionRate: 0.2, // Default 20% commission
        };
      }

      let result: Service;

      if (mode === "create") {
        result = await createService(serviceData as CreateServiceData);
        toast.success("Service successfully created");
      } else {
        if (!service?._id) {
          throw new Error("Service ID is required for update");
        }
        result = await updateService(
          service._id,
          serviceData as UpdateServiceData
        );
        toast.success("Service successfully updated");
      }

      // Show success message
      setSubmitSuccess(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/services/${result.slug}`);
      }, 1500);
    } catch (err) {
      console.error(`Failed to ${mode} service:`, err);
      toast.error(`Failed to ${mode} service`);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const selectedCategory = categories?.find(
    (cat) => cat._id === formData.categoryId
  );

  if (submitSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Service {mode === "create" ? "Created" : "Updated"} Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {mode === "create"
              ? "Your service has been submitted for review. Redirecting..."
              : "Your changes have been saved. Redirecting..."}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create New Service" : "Edit Service"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {mode === "create"
              ? "Fill in the details to create a new service offering"
              : "Update the service details below"}
          </p>
        </div>

        {/* Scrollable Form */}
        <ScrollArea className="h-[calc(92vh-280px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Service Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  validationErrors.title
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
                placeholder="e.g., Professional House Cleaning Service"
              />
              {validationErrors.title && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Category with Popover */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading categories...</span>
                </div>
              ) : categoriesError ? (
                <div className="text-sm text-red-600 dark:text-red-400 px-4 py-2 border border-red-500 rounded-lg">
                  Failed to load categories. Please refresh the page.
                </div>
              ) : (
                <Popover
                  open={categoryPopoverOpen}
                  onOpenChange={setCategoryPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryPopoverOpen}
                      className={cn(
                        "w-full justify-between h-auto min-h-[42px] px-4 py-2",
                        !formData.categoryId && "text-muted-foreground",
                        validationErrors.categoryId && "border-red-500"
                      )}
                    >
                      {selectedCategory ? (
                        <div className="flex items-center gap-3 flex-1">
                          {selectedCategory.catCoverId && (
                            <img
                              src={selectedCategory.catCoverId.thumbnailUrl}
                              alt={selectedCategory.catName}
                              className="h-8 w-8 rounded object-cover shrink-0"
                            />
                          )}
                          <span className="truncate">
                            {selectedCategory.catName}
                          </span>
                        </div>
                      ) : (
                        "Select a category"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <ScrollArea className="h-[300px]">
                      <div className="p-1">
                        {categories?.map((category) => (
                          <button
                            key={category._id}
                            type="button"
                            onClick={() => handleCategorySelect(category._id)}
                            className={cn(
                              "relative flex w-full items-center gap-3 rounded-sm px-2 py-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                              formData.categoryId === category._id &&
                                "bg-accent"
                            )}
                          >
                            {category.catCoverId && (
                              <img
                                src={category.catCoverId.thumbnailUrl}
                                alt={category.catName}
                                className="h-10 w-10 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="flex-1 text-left truncate">
                              {category.catName}
                            </span>
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                formData.categoryId === category._id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
              {validationErrors.categoryId && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.categoryId}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                  validationErrors.description
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
                placeholder="Describe your service in detail..."
              />
              <div className="flex items-center justify-between mt-1">
                {validationErrors.description ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum 20 characters
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.description.length} / 5000
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="cleaning, professional, home service"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Pricing Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pricing (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Base Price */}
                <div>
                  <label
                    htmlFor="serviceBasePrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Base Price
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="GHS">GHS</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input
                      type="number"
                      id="serviceBasePrice"
                      name="serviceBasePrice"
                      value={formData.serviceBasePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        validationErrors.serviceBasePrice
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {validationErrors.serviceBasePrice && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.serviceBasePrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Fees Switches */}
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label
                      htmlFor="includeTravelFee"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      Include travel fee
                    </label>
                    <Switch
                      id="includeTravelFee"
                      checked={formData.includeTravelFee}
                      onCheckedChange={(checked) =>
                        handleInputChange({
                          target: {
                            name: "includeTravelFee",
                            type: "checkbox",
                            checked,
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-all duration-200">
                    {formData.includeTravelFee
                      ? "Client will pay for transportation separately, depending on the distance"
                      : "The quoted price includes transportation"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label
                      htmlFor="includeAdditionalFees"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      Include additional fees
                    </label>
                    <Switch
                      id="includeAdditionalFees"
                      checked={formData.includeAdditionalFees}
                      onCheckedChange={(checked) =>
                        handleInputChange({
                          target: {
                            name: "includeAdditionalFees",
                            type: "checkbox",
                            checked,
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-all duration-200">
                    {formData.includeAdditionalFees
                      ? "Client will pay for additional purchases (tools, materials, etc.) separately"
                      : "The quoted price includes all necessary tools and materials"}
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Setting */}
            {(user?.systemRole === SystemRole.ADMIN ||
              user?.systemRole === SystemRole.SUPER_ADMIN) && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mark as private
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Private services can only be associated to company trained
                      providers
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Add bottom padding for scroll area */}
            <div className="h-4"></div>
          </form>
        </ScrollArea>

        {/* Fixed Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {mode === "create" ? "Create Service" : "Update Service"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
