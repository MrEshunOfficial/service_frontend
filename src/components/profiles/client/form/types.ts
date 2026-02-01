import { z } from "zod";

// ============================================================================
// FORM STEP CONFIGURATION
// ============================================================================

export interface FormStep {
  id: number;
  name: string;
  component: React.ComponentType;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const personalInfoSchema = z.object({
  preferredName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  dateOfBirth: z.string().optional(),
  clientContactInfo: z
    .object({
      secondaryContact: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
        .optional(),
      emailAddress: z.string().email("Invalid email address").optional(),
    })
    .optional(),
});

export const locationSchema = z.object({
  savedAddresses: z
    .array(
      z.object({
        ghanaPostGPS: z
          .string()
          .min(1, "GPS address is required")
          .regex(/^[A-Z]{2}-\d{3}-\d{4}$/, "Invalid Ghana Post GPS format (e.g., GA-123-4567)"),
        nearbyLandmark: z.string().max(200).optional(),
        region: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        locality: z.string().optional(),
        streetName: z.string().optional(),
        houseNumber: z.string().optional(),
        gpsCoordinates: z
          .object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180),
          })
          .optional(),
        isAddressVerified: z.boolean().optional(),
        sourceProvider: z
          .enum(["openstreetmap", "google", "ghanapost"])
          .optional(),
      })
    )
    .min(1, "At least one address is required")
    .optional(),
});

export const preferencesSchema = z.object({
  preferences: z
    .object({
      preferredCategories: z.array(z.string()).optional(),
      languagePreference: z.string().optional(),
      communicationPreferences: z
        .object({
          emailNotifications: z.boolean().default(true),
          smsNotifications: z.boolean().default(true),
          pushNotifications: z.boolean().default(true),
        })
        .optional(),
    })
    .optional(),
});

export const emergencyContactSchema = z.object({
  emergencyContact: z
    .object({
      name: z.string().min(2, "Emergency contact name is required").max(100),
      relationship: z.string().min(2, "Relationship is required"),
      phoneNumber: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, "Valid phone number is required"),
    })
    .optional(),
});

// Combined schema for the entire form
export const clientProfileFormSchema = z.object({
  ...personalInfoSchema.shape,
  ...locationSchema.shape,
  ...preferencesSchema.shape,
  ...emergencyContactSchema.shape,
});

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type PreferencesData = z.infer<typeof preferencesSchema>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
export type ClientProfileFormData = z.infer<typeof clientProfileFormSchema>;

// ============================================================================
// LOCATION ENRICHMENT TYPES
// ============================================================================

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface EnrichedLocationData {
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
  streetName?: string;
  houseNumber?: string;
  formattedAddress?: string;
}

export interface LocationState {
  coordinates: GeolocationCoordinates | null;
  enrichedData: EnrichedLocationData | null;
  isDetecting: boolean;
  isEnriching: boolean;
  error: string | null;
}

// ============================================================================
// SERVICE CATEGORIES
// ============================================================================

export const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Carpentry",
  "Painting",
  "HVAC",
  "Landscaping",
  "Moving",
  "Appliance Repair",
  "Security",
  "Pest Control",
  "Roofing",
  "Flooring",
  "Window Cleaning",
  "Handyman",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// ============================================================================
// LANGUAGE OPTIONS
// ============================================================================

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English", nativeName: "English" },
  { value: "tw", label: "Twi", nativeName: "Twi" },
  { value: "ga", label: "Ga", nativeName: "Ga" },
  { value: "ewe", label: "Ewe", nativeName: "Eʋe" },
  { value: "dag", label: "Dagbani", nativeName: "Dagbanli" },
] as const;

export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

// ============================================================================
// RELATIONSHIP OPTIONS
// ============================================================================

export const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "friend", label: "Friend" },
  { value: "colleague", label: "Colleague" },
  { value: "other_family", label: "Other Family Member" },
  { value: "other", label: "Other" },
] as const;

export type RelationshipOption = (typeof RELATIONSHIP_OPTIONS)[number];

// ============================================================================
// FORM NAVIGATION TYPES
// ============================================================================

export interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isLastStep?: boolean;
}

export interface FormProgressProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface FormError {
  field?: string;
  message: string;
  code?: string;
}

export interface FormSubmissionError {
  errors: FormError[];
  message: string;
}
