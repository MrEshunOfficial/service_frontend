import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import type { CreateProviderProfileRequest } from "@/types/profiles/provider-profile.types";
import { toast } from "sonner";
import { useProviderProfile } from "@/hooks/profiles/useProviderProfile";
import { AvailabilityStep } from "./AvailabilityStep";
import { BusinessInfoStep } from "./BusinessInfoStep";
import { ContactInfoStep } from "./ContactInfoStep";
import { FormProgress } from "./FormProgress";
import { IdVerificationStep } from "./IdVerificationStep";
import { LocationStep } from "./LocationStep";
import { PaymentSettingsStep } from "./PaymentSettingsStep";
import { providerProfileSchema } from "./providerProfileSchema";
import { ServiceSelectionStep } from "./ServiceSelectionStep";
import { useRouter } from "next/navigation";

type ProviderProfileFormData = z.infer<typeof providerProfileSchema>;

const FORM_STEPS = [
  {
    id: 1,
    title: "Business Info",
    component: BusinessInfoStep,
    required: true,
  },
  {
    id: 2,
    title: "Contact Details",
    component: ContactInfoStep,
    required: true,
  },
  { id: 3, title: "Location", component: LocationStep, required: true },
  {
    id: 4,
    title: "ID Verification",
    component: IdVerificationStep,
    required: false,
  },
  { id: 5, title: "Services", component: ServiceSelectionStep, required: true },
  {
    id: 6,
    title: "Availability",
    component: AvailabilityStep,
    required: false,
  },
  {
    id: 7,
    title: "Payment Settings",
    component: PaymentSettingsStep,
    required: false,
  },
];

export function CreateProviderProfileForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const { createProfile, loading } = useProviderProfile(false);
  const router = useRouter();

  const form = useForm<ProviderProfileFormData>({
    resolver: zodResolver(providerProfileSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      isCompanyTrained: false,
      providerContactInfo: {
        primaryContact: "",
        secondaryContact: "",
        businessContact: "",
        businessEmail: "",
      },
      locationData: {
        ghanaPostGPS: "",
        nearbyLandmark: "",
        region: "",
        city: "",
        district: "",
        locality: "",
        streetName: "",
        houseNumber: "",
        gpsCoordinates: undefined,
        isAddressVerified: false,
        sourceProvider: undefined,
      },
      IdDetails: undefined, // Start as undefined - completely optional
      serviceOfferings: [],
      isAlwaysAvailable: true,
      workingHours: {},
      requireInitialDeposit: false,
      percentageDeposit: 0,
      BusinessGalleryImages: [],
    },
  });

  const onSubmit = async (data: ProviderProfileFormData) => {
    try {
      // Transform form data to API format
      const requestData: CreateProviderProfileRequest = {
        businessName: data.businessName,
        isCompanyTrained: data.isCompanyTrained,
        providerContactInfo: data.providerContactInfo,
        locationData: data.locationData,
        // Only include ID details if they actually have data
        IdDetails:
          data.IdDetails?.idType &&
          data.IdDetails?.idNumber &&
          data.IdDetails?.idImages?.length
            ? {
                idType: data.IdDetails.idType,
                idNumber: data.IdDetails.idNumber,
                fileImage: data.IdDetails.idImages as any,
              }
            : undefined,
        serviceOfferings: data.serviceOfferings,
        BusinessGalleryImages: data.BusinessGalleryImages || [],
        isAlwaysAvailable: data.isAlwaysAvailable,
        // Only include working hours if not always available
        workingHours: !data.isAlwaysAvailable ? data.workingHours : undefined,
        requireInitialDeposit: data.requireInitialDeposit,
        // Only include deposit percentage if deposits are required
        percentageDeposit: data.requireInitialDeposit
          ? data.percentageDeposit
          : undefined,
      };

      await createProfile(requestData);

      toast.success("Provider profile created successfully!");
      router.push("/profile");
    } catch (error) {
      toast.error(
        `Failed to create provider profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const getFieldsForStep = (step: number): string[] => {
    const fieldMap: Record<number, string[]> = {
      1: ["businessName", "isCompanyTrained"],
      2: ["providerContactInfo.primaryContact"],
      3: ["locationData.ghanaPostGPS"],
      4: [], // ID verification is completely optional
      5: ["serviceOfferings"],
      6: [], // Availability fields are conditionally validated
      7: [], // Payment fields are conditionally validated
    };
    return fieldMap[step] || [];
  };

  const isStepRequired = (step: number): boolean => {
    return FORM_STEPS[step - 1]?.required ?? false;
  };

  const canSkipStep = (step: number): boolean => {
    return !isStepRequired(step);
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    // For optional steps that are skipped, we don't validate at all
    if (skippedSteps.has(currentStep) && canSkipStep(currentStep)) {
      return true;
    }

    const fields = getFieldsForStep(currentStep);

    // Step 4: ID Verification - completely optional, no validation unless user wants to provide it
    if (currentStep === 4) {
      // Simply allow proceeding - backend handles profile association
      return true;
    }

    // Step 6: Availability - only validate if user chose NOT to be always available
    if (currentStep === 6) {
      const isAlwaysAvailable = form.getValues("isAlwaysAvailable");
      if (!isAlwaysAvailable) {
        const workingHoursValid = await form.trigger("workingHours");
        if (!workingHoursValid) {
          toast.error(
            "Please set your working hours or mark yourself as always available",
          );
          return false;
        }
      }
      return true;
    }

    // Step 7: Payment Settings - only validate if user requires deposit
    if (currentStep === 7) {
      const requireDeposit = form.getValues("requireInitialDeposit");
      if (requireDeposit) {
        const depositValid = await form.trigger("percentageDeposit");
        if (!depositValid) {
          toast.error("Please set the deposit percentage");
          return false;
        }
      }
      return true;
    }

    // For required steps, validate all required fields
    if (isStepRequired(currentStep) && fields.length > 0) {
      const isValid = await form.trigger(fields as any);

      if (!isValid) {
        const errors = form.formState.errors;
        console.log("Validation errors for step", currentStep, ":", errors);
        toast.error("Please fill in all required fields");
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();

    if (isValid) {
      // Remove current step from skipped steps if it was previously skipped
      setSkippedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentStep);
        return newSet;
      });

      if (currentStep < FORM_STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final submission
        const formValid = await form.trigger();
        console.log("Form validation result:", formValid);
        console.log("Form errors:", form.formState.errors);

        if (formValid) {
          form.handleSubmit(onSubmit)();
        } else {
          toast.error("Please review and complete all required fields");

          // Find first step with errors and navigate to it
          const errors = form.formState.errors;

          if (errors.businessName || errors.isCompanyTrained) {
            setCurrentStep(1);
          } else if (errors.providerContactInfo) {
            setCurrentStep(2);
          } else if (errors.locationData) {
            setCurrentStep(3);
          } else if (errors.serviceOfferings) {
            setCurrentStep(5);
          } else if (errors.workingHours) {
            setCurrentStep(6);
          } else if (errors.percentageDeposit) {
            setCurrentStep(7);
          }
        }
      }
    }
  };

  const handleSkip = () => {
    if (canSkipStep(currentStep)) {
      // Mark step as skipped
      setSkippedSteps((prev) => new Set(prev).add(currentStep));

      // Clear any validation errors for this step
      const fields = getFieldsForStep(currentStep);
      fields.forEach((field) => {
        form.clearErrors(field as any);
      });

      // For ID verification step, also clear the entire IdDetails object
      if (currentStep === 4) {
        form.setValue("IdDetails", undefined);
      }

      if (currentStep < FORM_STEPS.length) {
        setCurrentStep(currentStep + 1);
      }

      toast.info(
        `${FORM_STEPS[currentStep - 1].title} skipped - you can complete it later`,
      );
    } else {
      toast.error("This step is required and cannot be skipped");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const CurrentStepComponent = FORM_STEPS[currentStep - 1].component;
  const currentStepSkipped = skippedSteps.has(currentStep);

  return (
    <div className="min-h-screen py-12 px-4 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Create Provider Profile
          </h1>
          <p className="text-muted-foreground">
            Complete all required steps to start offering your services
          </p>

          {skippedSteps.size > 0 && (
            <div className="mt-4 inline-block px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ You have {skippedSteps.size} skipped optional step
                {skippedSteps.size > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        <FormProgress
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          steps={FORM_STEPS}
          skippedSteps={skippedSteps}
          onStepClick={handleStepClick}
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 p-8 mt-8 border border-slate-200 dark:border-slate-800">
          {/* Step Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-foreground">
                {FORM_STEPS[currentStep - 1].title}
              </h2>
              {!isStepRequired(currentStep) && (
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Optional
                </span>
              )}
            </div>

            {currentStepSkipped && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ This step was previously skipped. Complete it now or skip
                  again to continue.
                </p>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <CurrentStepComponent form={form} />

              <div className="flex justify-between pt-6 border-t border-border gap-4">
                {/* Previous Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || loading}
                  className="min-w-[120px]">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  {/* Skip Button - Only show for optional steps */}
                  {canSkipStep(currentStep) &&
                    currentStep < FORM_STEPS.length && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={loading}
                        className="min-w-[120px] text-muted-foreground hover:text-foreground">
                        Skip for now
                      </Button>
                    )}

                  {/* Next/Submit Button */}
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="min-w-[120px]">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : currentStep === FORM_STEPS.length ? (
                      "Submit"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Step {currentStep} of {FORM_STEPS.length} •{" "}
            {FORM_STEPS.filter((s) => s.required).length} required steps •{" "}
            {FORM_STEPS.filter((s) => !s.required).length} optional steps
          </p>
        </div>
      </div>
    </div>
  );
}
