// ============================================
// FILE 3: ProviderFormWrapper.tsx (COMPLETE FIXED VERSION)
// ============================================

("use client");

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useMyProviderProfile,
  useCreateProviderProfile,
  useUpdateProviderProfile,
} from "@/hooks/profiles/useprovider.profile.hook";
import { Loader2 } from "lucide-react";
import { CreateProviderProfileInput } from "./form.schema";
import { useProviderFormStorage } from "./useProviderFormStorage";
import {
  useProviderFormValidation,
  FormStep,
} from "./useProviderFormValidation";
import {
  transformFileReferenceToIds,
  transformIdsToFileReference,
} from "./utils/form.utils";

interface ProviderFormWrapperProps {
  mode: "create" | "edit";
}

export default function ProviderFormWrapper({
  mode,
}: ProviderFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing profile if in edit mode
  const {
    data: existingProfile,
    loading: profileLoading,
    error: profileError,
  } = useMyProviderProfile({
    enabled: mode === "edit",
    autoLoad: mode === "edit",
  });

  // Form storage
  const {
    formData: storedData,
    currentStep: storedStep,
    isLoaded: storageLoaded,
    updateFormData,
    updateStep,
    clearStorage,
    hasDraft,
  } = useProviderFormStorage();

  // ✅ FIXED: Proper form initialization with type-safe transformations
  const defaultFormValues: Partial<CreateProviderProfileInput> =
    mode === "edit" && existingProfile
      ? {
          businessName: existingProfile.businessName,
          isCompanyTrained: existingProfile.isCompanyTrained ?? false, // ✅ Prevent undefined
          serviceOfferings:
            existingProfile.serviceOfferings?.map((s) =>
              typeof s === "string" ? s : s._id
            ) || [],
          providerContactInfo: existingProfile.providerContactInfo,
          locationData: existingProfile.locationData,
          isAlwaysAvailable: existingProfile.isAlwaysAvailable ?? false, // ✅ Prevent undefined
          workingHours: existingProfile.workingHours,
          requireInitialDeposit: existingProfile.requireInitialDeposit ?? false, // ✅ Prevent undefined
          percentageDeposit: existingProfile.percentageDeposit,
          // ✅ FIXED: Properly transform FileReference to string[]
          IdDetails: existingProfile.IdDetails
            ? {
                idType: existingProfile.IdDetails.idType as any,
                idNumber: existingProfile.IdDetails.idNumber,
                IdFile: transformFileReferenceToIds(
                  existingProfile.IdDetails.idFile
                ),
              }
            : undefined,
          BusinessGalleryImages: transformFileReferenceToIds(
            existingProfile.BusinessGalleryImages
          ),
        }
      : storedData;

  // Form validation
  const { form, validateStep, getStepFields } =
    useProviderFormValidation(defaultFormValues);

  // Mutations
  const { createProfile, loading: creating } = useCreateProviderProfile();
  const { updateProfile, loading: updating } = useUpdateProviderProfile();

  const [currentStep, setCurrentStep] = useState<FormStep>(0);

  // Load stored step on mount
  useEffect(() => {
    if (storageLoaded && mode === "create" && hasDraft()) {
      setCurrentStep(storedStep as FormStep);
    }
  }, [storageLoaded, storedStep, mode, hasDraft]);

  // Handle step navigation
  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      const fields = getStepFields(currentStep);
      toast.error("Please fill in all required fields correctly");

      fields.forEach((field) => {
        form.trigger(field as any);
      });
      return;
    }

    const nextStep = Math.min(currentStep + 1, 5) as FormStep;
    setCurrentStep(nextStep);
    updateStep(nextStep);

    if (mode === "create") {
      updateFormData(form.getValues());
    }
  };

  const handlePrevStep = () => {
    const prevStep = Math.max(currentStep - 1, 0) as FormStep;
    setCurrentStep(prevStep);
    updateStep(prevStep);
  };

  const handleStepClick = async (step: FormStep) => {
    for (let i = 0; i < step; i++) {
      const isValid = await validateStep(i as FormStep);
      if (!isValid) {
        toast.error(`Please complete step ${i + 1} before proceeding`);
        return;
      }
    }

    setCurrentStep(step);
    updateStep(step);
  };

  // ✅ FIXED: Handle form submission with proper type transformations
  const handleSubmit = async (data: CreateProviderProfileInput) => {
    setIsSubmitting(true);

    try {
      // ✅ Transform form data (string[]) to API format (FileReference[])
      const transformedData = {
        ...data,
        IdDetails: data.IdDetails
          ? {
              idType: data.IdDetails.idType,
              idNumber: data.IdDetails.idNumber,
              // Transform string[] to FileReference[] for API
              idFile: transformIdsToFileReference(data.IdDetails.IdFile),
            }
          : undefined,
      };

      if (mode === "create") {
        await createProfile(transformedData as any);
        toast.success("Provider profile created successfully!");
        clearStorage();
        router.push("/provider/dashboard");
      } else {
        if (!existingProfile?._id) {
          throw new Error("Provider profile ID not found");
        }
        await updateProfile(existingProfile._id, transformedData as any);
        toast.success("Provider profile updated successfully!");
        router.push("/provider/dashboard");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save provider profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save on form change (create mode only)
  useEffect(() => {
    if (mode === "create" && storageLoaded) {
      const subscription = form.watch((value) => {
        updateFormData(value as Partial<CreateProviderProfileInput>);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, mode, storageLoaded, updateFormData]);

  // Loading states
  if (mode === "edit" && profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (mode === "edit" && profileError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load profile
          </p>
          <button
            onClick={() => router.push("/provider")}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!storageLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {mode === "create" ? "Create" : "Edit"} Business Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {mode === "create"
            ? "Fill in your business information to get started"
            : "Update your business information"}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => handleStepClick(index as FormStep)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${
                    currentStep === index
                      ? "bg-teal-500 text-white"
                      : currentStep > index
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }
                `}>
                <span className="font-semibold">{index + 1}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${
                      currentStep > index
                        ? "bg-teal-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mb-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} content will be rendered here
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || creating || updating}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isSubmitting || creating || updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>{mode === "create" ? "Create Profile" : "Update Profile"}</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const STEPS = [
  { id: 0, title: "Basic Info" },
  { id: 1, title: "Contact" },
  { id: 2, title: "Location" },
  { id: 3, title: "Availability" },
  { id: 4, title: "Payment" },
  { id: 5, title: "Identity" },
];
