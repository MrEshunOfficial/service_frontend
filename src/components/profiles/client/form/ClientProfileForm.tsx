import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormNavigation } from "./FormNavigation";
import { FormProgress } from "./FormProgress";
import { useClientProfile } from "@/hooks/profiles/useClientProfile";
import { CreateClientProfileRequest } from "@/types/profiles/client.profile.types";
import { EmergencyContactStep } from "./EmergencyContactStep";
import { LocationStep } from "./LocationStep";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { ReviewStep } from "./ReviewStep";

// Validation schema
const clientProfileSchema = z.object({
  // Personal Info
  preferredName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  dateOfBirth: z.string().optional(),
  clientContactInfo: z
    .object({
      secondaryContact: z.string().optional(),
      emailAddress: z.string().email("Invalid email address").optional(),
    })
    .optional(),

  // Location
  savedAddresses: z
    .array(
      z.object({
        ghanaPostGPS: z.string().min(1, "GPS address is required"),
        nearbyLandmark: z.string().optional(),
        region: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        locality: z.string().optional(),
        gpsCoordinates: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),

  // Preferences
  preferences: z
    .object({
      preferredCategories: z.array(z.string()).optional(),
      languagePreference: z.string().optional(),
      communicationPreferences: z
        .object({
          emailNotifications: z.boolean().default(true).optional(),
          smsNotifications: z.boolean().default(true).optional(),
          pushNotifications: z.boolean().default(true).optional(),
        })
        .optional(),
    })
    .optional(),

  // Emergency Contact
  emergencyContact: z
    .object({
      name: z.string().min(2, "Emergency contact name is required"),
      relationship: z.string().min(2, "Relationship is required"),
      phoneNumber: z.string().min(10, "Valid phone number is required"),
    })
    .optional(),
});

type ClientProfileFormData = z.infer<typeof clientProfileSchema>;

interface ClientProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, name: "Personal Info", component: PersonalInfoStep },
  { id: 2, name: "Location", component: LocationStep },
  // { id: 3, name: "Preferences", component: PreferencesStep },
  { id: 3, name: "Emergency Contact", component: EmergencyContactStep },
  { id: 4, name: "Review", component: ReviewStep },
];

export function ClientProfileForm({
  onSuccess,
  onCancel,
}: ClientProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { createProfile, loading } = useClientProfile(false);

  const methods = useForm<ClientProfileFormData>({
    resolver: zodResolver(clientProfileSchema),
    mode: "onChange",
    defaultValues: {
      preferences: {
        communicationPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
        },
      },
    },
  });

  const onSubmit = async (data: ClientProfileFormData) => {
    try {
      // Transform data to match API expectations
      const profileData: CreateClientProfileRequest = {
        preferredName: data.preferredName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        clientContactInfo: data.clientContactInfo,
        savedAddresses: data.savedAddresses,
        preferences: data.preferences,
        emergencyContact: data.emergencyContact,
      };

      await createProfile(profileData);
      onSuccess?.();
    } catch (error) {
      console.error("Profile creation failed:", error);
    }
  };

  const handleNext = async () => {
    const currentStepFields = getStepFields(currentStep);
    const isValid = await methods.trigger(currentStepFields as any);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    } else if (stepId > currentStep) {
      const currentStepFields = getStepFields(currentStep);
      const isValid = await methods.trigger(currentStepFields as any);
      if (isValid) {
        setCurrentStep(stepId);
      }
    }
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 1:
        return ["preferredName", "dateOfBirth", "clientContactInfo"];
      case 2:
        return ["savedAddresses"];
      case 3:
        return ["preferences"];
      case 4:
        return ["emergencyContact"];
      default:
        return [];
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const isLastStep = currentStep === STEPS.length;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <FormProgress
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="min-h-[400px]">
          <CurrentStepComponent />
        </div>

        <FormNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onCancel={onCancel}
          isLoading={loading}
          isLastStep={isLastStep}
        />
      </form>
    </FormProvider>
  );
}
