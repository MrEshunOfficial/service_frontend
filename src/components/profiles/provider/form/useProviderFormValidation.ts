// hooks/useProviderFormValidation.ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CreateProviderProfileInput,
  createProviderProfileSchema,
} from "./form.schema";

export type FormStep = 0 | 1 | 2 | 3 | 4 | 5;

export function useProviderFormValidation(
  defaultValues?: Partial<CreateProviderProfileInput>
) {
  // ✅ FIX: Ensure all boolean fields have proper defaults
  const normalizedDefaults: CreateProviderProfileInput = {
    // Required fields with defaults
    isCompanyTrained: defaultValues?.isCompanyTrained ?? false,
    serviceOfferings: defaultValues?.serviceOfferings ?? [],
    BusinessGalleryImages: defaultValues?.BusinessGalleryImages ?? [],
    providerContactInfo: defaultValues?.providerContactInfo ?? {
      primaryContact: "",
      secondaryContact: "",
      businessContact: "",
      businessEmail: "",
    },
    locationData: defaultValues?.locationData ?? {
      ghanaPostGPS: "",
      nearbyLandmark: "",
    },
    isAlwaysAvailable: defaultValues?.isAlwaysAvailable ?? false,
    requireInitialDeposit: defaultValues?.requireInitialDeposit ?? false,

    // Optional fields - only include if they exist
    ...(defaultValues?.businessName !== undefined && {
      businessName: defaultValues.businessName,
    }),
    ...(defaultValues?.IdDetails !== undefined && {
      IdDetails: defaultValues.IdDetails,
    }),
    ...(defaultValues?.workingHours !== undefined && {
      workingHours: defaultValues.workingHours,
    }),
    ...(defaultValues?.percentageDeposit !== undefined && {
      percentageDeposit: defaultValues.percentageDeposit,
    }),
  };

  const form = useForm<CreateProviderProfileInput>({
    resolver: zodResolver(createProviderProfileSchema),
    defaultValues: normalizedDefaults,
    mode: "onChange",
  });

  // Validate specific step
  const validateStep = async (step: FormStep): Promise<boolean> => {
    const fields = getStepFields(step);

    // Trigger validation for fields in this step
    const results = await Promise.all(
      fields.map((field) => form.trigger(field as any))
    );

    return results.every((result) => result === true);
  };

  // Get fields for current step
  const getStepFields = (
    step: FormStep
  ): (keyof CreateProviderProfileInput)[] => {
    switch (step) {
      case 0:
        return ["businessName", "isCompanyTrained", "serviceOfferings"];
      case 1:
        return ["providerContactInfo"];
      case 2:
        return ["locationData"];
      case 3:
        return ["isAlwaysAvailable", "workingHours"];
      case 4:
        return ["requireInitialDeposit", "percentageDeposit"];
      case 5:
        return ["IdDetails", "BusinessGalleryImages"];
      default:
        return [];
    }
  };

  return {
    form,
    validateStep,
    getStepFields,
  };
}
