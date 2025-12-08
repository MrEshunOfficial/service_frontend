import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ProviderFormProvider,
  useProviderForm,
  FormStep,
  useFormProgress,
} from "./ProviderFormContext";
import { ProviderProfileFormData } from "./form.schema";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

import BusinessInfoStep from "./form.ui/BusinessInfoStep";
import LocationStep from "./form.ui/LocationStep";
import ReviewStep from "./form.ui/ReviewStep";
import ServicesStep from "./form.ui/ServicesStep";

import {
  useCreateProviderProfile,
  useUpdateProviderProfile,
} from "@/hooks/profiles/useprovider.profile.hook";
import { toast } from "sonner";

interface ProviderProfileFormProps {
  mode: "create" | "edit";
  providerId?: string;
  existingData?: Partial<ProviderProfileFormData>;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: Error) => void;
}

// Step configuration
const STEP_CONFIG = {
  [FormStep.BUSINESS_INFO]: {
    title: "Business Information",
    description: "Tell us about your business and availability",
    component: BusinessInfoStep,
  },
  [FormStep.SERVICES]: {
    title: "Service Offerings",
    description: "Select the services you provide",
    component: ServicesStep,
  },
  [FormStep.LOCATION]: {
    title: "Location Details",
    description: "Provide your business location information",
    component: LocationStep,
  },
  [FormStep.REVIEW]: {
    title: "Review & Submit",
    description: "Review your information before submitting",
    component: ReviewStep,
  },
};

// Progress indicator component
const ProgressIndicator: React.FC = () => {
  const { currentStepIndex } = useFormProgress();
  const steps = Object.values(FormStep);

  return (
    <div className="w-full mb-3">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const config = STEP_CONFIG[step];

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isCompleted
                      ? "bg-teal-600 text-white"
                      : isActive
                      ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isActive ? "text-teal-600" : "text-gray-600"
                    }`}>
                    {config.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    {config.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    isCompleted ? "bg-teal-600" : "bg-gray-200"
                  }`}
                  style={{ maxWidth: "100px" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Internal form component that uses the context
const ProviderProfileFormContent: React.FC<{
  mode: "create" | "edit";
  providerId?: string;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: Error) => void;
}> = ({ mode, providerId, onSubmitSuccess, onSubmitError }) => {
  const router = useRouter();
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    isSubmitting: contextSubmitting,
    form,
    clearProgress,
  } = useProviderForm();
  const { isFirstStep, isLastStep } = useFormProgress();

  // Use the appropriate mutation hook based on mode
  const {
    createProfile,
    loading: createLoading,
    error: createError,
  } = useCreateProviderProfile();
  const {
    updateProfile,
    loading: updateLoading,
    error: updateError,
  } = useUpdateProviderProfile();

  const [error, setError] = React.useState<string | null>(null);

  // Determine if we're currently submitting
  const isSubmitting = contextSubmitting || createLoading || updateLoading;

  // Update error state when mutation errors occur
  useEffect(() => {
    if (createError) {
      setError(createError.message);
      if (onSubmitError) {
        onSubmitError(createError);
      }
    }
  }, [createError, onSubmitError]);

  useEffect(() => {
    if (updateError) {
      setError(updateError.message);
      if (onSubmitError) {
        onSubmitError(updateError);
      }
    }
  }, [updateError, onSubmitError]);

  // Get current step component
  const CurrentStepComponent = STEP_CONFIG[currentStep].component;

  // Handle next step with validation
  const handleNext = async () => {
    setError(null);

    // Validate current step before proceeding
    let fieldsToValidate: (keyof ProviderProfileFormData)[] = [];

    switch (currentStep) {
      case FormStep.BUSINESS_INFO:
        fieldsToValidate = [
          "businessName",
          "isCompanyTrained",
          "providerContactInfo",
          "isAlwaysAvailable",
          "requireInitialDeposit",
        ];
        break;
      case FormStep.SERVICES:
        fieldsToValidate = ["serviceOfferings"];
        break;
      case FormStep.LOCATION:
        fieldsToValidate = ["locationData"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    goToNextStep();
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);

    try {
      // Validate all fields
      const isValid = await form.trigger();
      if (!isValid) {
        setError("Please check all fields and correct any errors.");
        return;
      }

      // Get form data
      const formData = form.getValues();

      let result;

      // Call appropriate mutation based on mode
      if (mode === "edit" && providerId) {
        result = await updateProfile(providerId, formData);
      } else {
        result = await createProfile(formData);
      }

      // Clear saved progress from localStorage
      clearProgress();

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }

      // Redirect after successful submission
      router.push("/profile");
      toast.success("successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the form.";
      setError(errorMessage);

      if (onSubmitError && err instanceof Error) {
        onSubmitError(err);
      }
      toast.error("failed!");
    }
  };

  return (
    <div className="w-full p-2 ">
      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-2 max-h-[70vh] overflow-auto">
        <div className="mb-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {STEP_CONFIG[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {STEP_CONFIG[currentStep].description}
          </p>
        </div>

        <CurrentStepComponent />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep || isSubmitting}
          className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        {/* Auto-save indicator */}
        <small className="text-center text-sm text-gray-500">
          Your progress is automatically saved
        </small>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/provider")}
            disabled={isSubmitting}>
            Cancel
          </Button>

          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Update Profile" : "Create Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component that wraps everything with the provider
export const ProviderProfileForm: React.FC<ProviderProfileFormProps> = ({
  mode,
  providerId,
  existingData,
  onSubmitSuccess,
  onSubmitError,
}) => {
  const handleSubmit = async () => {};

  return (
    <ProviderFormProvider onSubmit={handleSubmit} onError={onSubmitError}>
      <ProviderFormInitializer
        mode={mode}
        providerId={providerId}
        existingData={existingData}
      />
      <ProviderProfileFormContent
        mode={mode}
        providerId={providerId}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitError={onSubmitError}
      />
    </ProviderFormProvider>
  );
};

// Component to initialize form data for edit mode
const ProviderFormInitializer: React.FC<{
  mode: "create" | "edit";
  providerId?: string;
  existingData?: Partial<ProviderProfileFormData>;
}> = ({ mode, providerId, existingData }) => {
  const { loadExistingProvider } = useProviderForm();

  useEffect(() => {
    if (mode === "edit" && providerId && existingData) {
      loadExistingProvider(providerId, existingData);
    }
  }, [mode, providerId, existingData, loadExistingProvider]);

  return null;
};

export default ProviderProfileForm;
