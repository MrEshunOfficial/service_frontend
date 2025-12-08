import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProviderProfileFormData,
  providerProfileFormSchema,
} from "./form.schema";

// Form step types - Simplified to 4 steps
export enum FormStep {
  BUSINESS_INFO = "business_info", // Business name, contact info, availability, deposit settings
  SERVICES = "services", // Service offerings
  LOCATION = "location", // Location data and GPS coordinates
  REVIEW = "review", // Review all information before submitting
}

// Storage keys
const STORAGE_KEYS = {
  FORM_DATA: "provider_form_data",
  CURRENT_STEP: "provider_form_step",
  IS_EDITING: "provider_form_is_editing",
  PROVIDER_ID: "provider_form_id",
} as const;

type ProviderFormType = UseFormReturn<ProviderProfileFormData>;

interface ProviderFormContextValue {
  form: ProviderFormType;
  currentStep: FormStep;
  isEditing: boolean;
  providerId?: string;
  isSubmitting: boolean;
  setCurrentStep: (step: FormStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  saveProgress: () => void;
  clearProgress: () => void;
  submitForm: () => Promise<void>;
  loadExistingProvider: (
    providerId: string,
    data: Partial<ProviderProfileFormData>
  ) => void;
}

const ProviderFormContext = createContext<ProviderFormContextValue | undefined>(
  undefined
);

export const useProviderForm = () => {
  const context = useContext(ProviderFormContext);
  if (!context) {
    throw new Error("useProviderForm must be used within ProviderFormProvider");
  }
  return context;
};

// Step order - Simplified to 4 steps
const STEP_ORDER: FormStep[] = [
  FormStep.BUSINESS_INFO,
  FormStep.SERVICES,
  FormStep.LOCATION,
  FormStep.REVIEW,
];

interface ProviderFormProviderProps {
  children: React.ReactNode;
  onSubmit: (
    data: ProviderProfileFormData,
    isEditing: boolean,
    providerId?: string
  ) => Promise<void>;
  onError?: (error: Error) => void;
}

const getDefaultValues = (): ProviderProfileFormData => ({
  businessName: "",
  isCompanyTrained: false,
  serviceOfferings: [],
  providerContactInfo: {
    primaryContact: "",
    secondaryContact: "",
    businessContact: "",
    businessEmail: "",
  },
  locationData: {
    ghanaPostGPS: "",
    nearbyLandmark: "",
    gpsCoordinates: {
      latitude: 0,
      longitude: 0,
    },
  },
  isAlwaysAvailable: false,
  requireInitialDeposit: false,
});

export const ProviderFormProvider: React.FC<ProviderFormProviderProps> = ({
  children,
  onSubmit,
  onError,
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(
    FormStep.BUSINESS_INFO
  );
  const [isEditing, setIsEditing] = useState(false);
  const [providerId, setProviderId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize form with react-hook-form
  const form = useForm<ProviderProfileFormData>({
    resolver: zodResolver(providerProfileFormSchema),
    defaultValues: getDefaultValues(),
    mode: "onBlur",
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING);
    const savedProviderId = localStorage.getItem(STORAGE_KEYS.PROVIDER_ID);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as ProviderProfileFormData;
        form.reset(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }

    if (savedStep && STEP_ORDER.includes(savedStep as FormStep)) {
      setCurrentStep(savedStep as FormStep);
    }

    if (savedIsEditing === "true") {
      setIsEditing(true);
    }

    if (savedProviderId) {
      setProviderId(savedProviderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    const formData = form.getValues();
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep);
    localStorage.setItem(STORAGE_KEYS.IS_EDITING, String(isEditing));
    if (providerId) {
      localStorage.setItem(STORAGE_KEYS.PROVIDER_ID, providerId);
    }
  }, [form, currentStep, isEditing, providerId]);

  // Auto-save on form changes (debounced)
  useEffect(() => {
    const subscription = form.watch(() => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress();
      }, 1000);
    });

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [form, saveProgress]);

  // Save step changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep);
  }, [currentStep]);

  // Clear progress from localStorage
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.IS_EDITING);
    localStorage.removeItem(STORAGE_KEYS.PROVIDER_ID);
    form.reset(getDefaultValues());
    setCurrentStep(FormStep.BUSINESS_INFO);
    setIsEditing(false);
    setProviderId(undefined);
  }, [form]);

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
      saveProgress();
    }
  }, [currentStep, saveProgress]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
      saveProgress();
    }
  }, [currentStep, saveProgress]);

  // Load existing provider data for editing
  const loadExistingProvider = useCallback(
    (id: string, data: Partial<ProviderProfileFormData>) => {
      setIsEditing(true);
      setProviderId(id);

      // Merge with default values to ensure all required fields exist
      const mergedData: ProviderProfileFormData = {
        businessName: data.businessName || "",
        isCompanyTrained: data.isCompanyTrained ?? false,
        serviceOfferings: data.serviceOfferings || [],
        providerContactInfo: {
          primaryContact: data.providerContactInfo?.primaryContact || "",
          secondaryContact: data.providerContactInfo?.secondaryContact,
          businessContact: data.providerContactInfo?.businessContact,
          businessEmail: data.providerContactInfo?.businessEmail,
        },
        locationData: {
          ghanaPostGPS: data.locationData?.ghanaPostGPS || "",
          nearbyLandmark: data.locationData?.nearbyLandmark,
          gpsCoordinates: data.locationData?.gpsCoordinates,
        },
        isAlwaysAvailable: data.isAlwaysAvailable ?? false,
        workingHours: data.workingHours,
        requireInitialDeposit: data.requireInitialDeposit ?? false,
        percentageDeposit: data.percentageDeposit,
      };

      form.reset(mergedData);
      localStorage.setItem(STORAGE_KEYS.IS_EDITING, "true");
      localStorage.setItem(STORAGE_KEYS.PROVIDER_ID, id);
      saveProgress();
    },
    [form, saveProgress]
  );

  // Submit form
  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        const errors = form.formState.errors;
        console.error("Form validation failed:", errors);
        throw new Error(
          "Form validation failed. Please check all required fields."
        );
      }

      const formData = form.getValues();
      await onSubmit(formData, isEditing, providerId);
      clearProgress();
    } catch (error) {
      console.error("Form submission error:", error);
      if (onError) {
        onError(error instanceof Error ? error : new Error("Unknown error"));
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit, onError, isEditing, providerId, clearProgress]);

  const value: ProviderFormContextValue = {
    form,
    currentStep,
    isEditing,
    providerId,
    isSubmitting,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    saveProgress,
    clearProgress,
    submitForm,
    loadExistingProvider,
  };

  return (
    <ProviderFormContext.Provider value={value}>
      {children}
    </ProviderFormContext.Provider>
  );
};

// Helper hook for step validation
export const useStepValidation = (step: FormStep) => {
  const { form } = useProviderForm();

  const validateStep = useCallback(async (): Promise<boolean> => {
    let fieldsToValidate: (keyof ProviderProfileFormData)[] = [];

    switch (step) {
      case FormStep.BUSINESS_INFO:
        // Validate all business-related fields
        fieldsToValidate = [
          "businessName",
          "isCompanyTrained",
          "providerContactInfo",
          "isAlwaysAvailable",
          "workingHours",
          "requireInitialDeposit",
          "percentageDeposit",
        ];
        break;
      case FormStep.SERVICES:
        fieldsToValidate = ["serviceOfferings"];
        break;
      case FormStep.LOCATION:
        fieldsToValidate = ["locationData"];
        break;
      case FormStep.REVIEW:
        // Validate all fields on review step
        return await form.trigger();
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  }, [form, step]);

  return { validateStep };
};

// Progress indicator helper
export const useFormProgress = () => {
  const { currentStep } = useProviderForm();

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return {
    currentStepIndex,
    totalSteps,
    progress,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === totalSteps - 1,
    stepName: currentStep,
  };
};
