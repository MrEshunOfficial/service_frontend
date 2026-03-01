import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
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
  {
    id: 5,
    title: "Availability",
    component: AvailabilityStep,
    required: false,
  },
  {
    id: 6,
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
      IdDetails: undefined,
      isAlwaysAvailable: true,
      workingHours: {},
      requireInitialDeposit: false,
      percentageDeposit: 0,
      BusinessGalleryImages: [],
    },
  });

  // ── Submission ────────────────────────────────────────────────────────────

  const onSubmit = async (data: ProviderProfileFormData) => {
    try {
      const requestData: CreateProviderProfileRequest = {
        businessName: data.businessName,
        isCompanyTrained: false, // handled at admin level
        providerContactInfo: data.providerContactInfo,
        locationData: data.locationData,
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
        serviceOfferings: [],
        BusinessGalleryImages: data.BusinessGalleryImages ?? [],
        isAlwaysAvailable: data.isAlwaysAvailable,
        workingHours: !data.isAlwaysAvailable ? data.workingHours : undefined,
        requireInitialDeposit: data.requireInitialDeposit,
        percentageDeposit: data.requireInitialDeposit
          ? data.percentageDeposit
          : undefined,
      };

      await createProfile(requestData);
      toast.success("Provider profile created!");
      router.push("/profile");
    } catch (error) {
      toast.error(
        `Failed to create provider profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  // ── Step validation ───────────────────────────────────────────────────────

  const getFieldsForStep = (step: number): string[] => {
    const fieldMap: Record<number, string[]> = {
      1: ["businessName"],
      2: ["providerContactInfo.primaryContact"],
      3: ["locationData.ghanaPostGPS"],
      4: [],
      5: [],
      6: [],
    };
    return fieldMap[step] ?? [];
  };

  const isStepRequired = (step: number) =>
    FORM_STEPS[step - 1]?.required ?? false;
  const canSkipStep = (step: number) => !isStepRequired(step);

  const validateCurrentStep = async (): Promise<boolean> => {
    if (skippedSteps.has(currentStep) && canSkipStep(currentStep)) return true;
    if (currentStep === 4) return true;

    if (currentStep === 5) {
      const isAlwaysAvailable = form.getValues("isAlwaysAvailable");
      if (!isAlwaysAvailable) {
        const valid = await form.trigger("workingHours");
        if (!valid) {
          toast.error(
            "Please set your working hours or mark yourself as always available",
          );
          return false;
        }
      }
      return true;
    }

    if (currentStep === 6) {
      const requireDeposit = form.getValues("requireInitialDeposit");
      if (requireDeposit) {
        const valid = await form.trigger("percentageDeposit");
        if (!valid) {
          toast.error("Please set the deposit percentage");
          return false;
        }
      }
      return true;
    }

    const fields = getFieldsForStep(currentStep);
    if (isStepRequired(currentStep) && fields.length > 0) {
      const isValid = await form.trigger(fields as any);
      if (!isValid) {
        toast.error("Please fill in all required fields");
        return false;
      }
    }

    return true;
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setSkippedSteps((prev) => {
      const next = new Set(prev);
      next.delete(currentStep);
      return next;
    });

    if (currentStep < FORM_STEPS.length) {
      setCurrentStep((s) => s + 1);
      return;
    }

    const formValid = await form.trigger();
    if (!formValid) {
      toast.error("Please review and complete all required fields");
      const errors = form.formState.errors;
      if (errors.businessName) setCurrentStep(1);
      else if (errors.providerContactInfo) setCurrentStep(2);
      else if (errors.locationData) setCurrentStep(3);
      else if (errors.workingHours) setCurrentStep(5);
      else if (errors.percentageDeposit) setCurrentStep(6);
      return;
    }

    form.handleSubmit(onSubmit)();
  };

  const handleSkip = () => {
    if (!canSkipStep(currentStep)) {
      toast.error("This step is required");
      return;
    }

    setSkippedSteps((prev) => new Set(prev).add(currentStep));
    getFieldsForStep(currentStep).forEach((field) => {
      form.clearErrors(field as any);
    });
    if (currentStep === 4) form.setValue("IdDetails", undefined);

    if (currentStep < FORM_STEPS.length) {
      setCurrentStep((s) => s + 1);
    }

    toast.info(
      `${FORM_STEPS[currentStep - 1].title} skipped — you can complete it later`,
    );
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const CurrentStepComponent = FORM_STEPS[currentStep - 1].component;
  const currentStepSkipped = skippedSteps.has(currentStep);
  const isLastStep = currentStep === FORM_STEPS.length;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Create Provider Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Complete the required steps to start offering your services
          </p>

          {skippedSteps.size > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                {skippedSteps.size}
                {skippedSteps.size > 1 ? "s" : ""} skipped
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <FormProgress
            currentStep={currentStep}
            totalSteps={FORM_STEPS.length}
            steps={FORM_STEPS}
            skippedSteps={skippedSteps}
            onStepClick={setCurrentStep}
          />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Card header strip */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Step {currentStep} of {FORM_STEPS.length}
              </span>
              <span className="text-slate-200 dark:text-slate-700">·</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {FORM_STEPS[currentStep - 1].title}
              </span>
            </div>
            {!isStepRequired(currentStep) && (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                Optional
              </span>
            )}
          </div>

          {/* Skipped notice */}
          {currentStepSkipped && (
            <div className="mx-6 mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-4 py-3">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ This step was previously skipped. Complete it now or skip
                again to continue.
              </p>
            </div>
          )}

          {/* Step content */}
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CurrentStepComponent form={form} />

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || loading}
                    className="h-10 px-4 min-w-[100px] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </Button>

                  <div className="flex items-center gap-2">
                    {canSkipStep(currentStep) && !isLastStep && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={loading}
                        className="h-10 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg text-sm"
                      >
                        Skip for now
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="h-10 px-5 min-w-[110px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-200 dark:shadow-blue-900/30 font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : isLastStep ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Submit
                        </>
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          {FORM_STEPS.filter((s) => s.required).length} required ·{" "}
          {FORM_STEPS.filter((s) => !s.required).length} optional
          {isLastStep && (
            <span className="block mt-1">
              After creating your profile, you can add services from your
              dashboard.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
