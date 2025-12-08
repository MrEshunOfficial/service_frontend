import { z } from "zod";

// Coordinates schema
const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Working hours schema for each day
const workingHoursSchema = z.record(
  z.string(),
  z.object({
    start: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      ),
    end: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      ),
  })
);

// Contact details schema - only fields user fills
const contactDetailsSchema = z.object({
  primaryContact: z
    .string()
    .min(10, "Primary contact must be at least 10 characters"),
  secondaryContact: z.string().optional(),
  businessContact: z.string().optional(),
  businessEmail: z.string().email("Invalid email format").optional(),
});

// Location schema - user-provided fields + generated coordinates
const userLocationSchema = z.object({
  ghanaPostGPS: z.string().min(1, "Ghana Post GPS is required"),
  nearbyLandmark: z.string().optional(),
  gpsCoordinates: coordinatesSchema.optional(),
  // All other fields (region, city, district, etc.) are auto-populated by backend
});

// Main provider profile form schema
export const providerProfileFormSchema = z
  .object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters")
      .optional(),
    isCompanyTrained: z.boolean(),
    serviceOfferings: z
      .array(z.string())
      .min(1, "At least one service must be selected"),
    providerContactInfo: contactDetailsSchema,
    locationData: userLocationSchema,
    isAlwaysAvailable: z.boolean(),
    workingHours: workingHoursSchema.optional(),
    requireInitialDeposit: z.boolean(),
    percentageDeposit: z.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      // If not always available, working hours must be provided
      if (!data.isAlwaysAvailable && !data.workingHours) {
        return false;
      }
      return true;
    },
    {
      message: "Working hours are required when not always available",
      path: ["workingHours"],
    }
  )
  .refine(
    (data) => {
      // If deposit required, percentage must be provided
      if (data.requireInitialDeposit && !data.percentageDeposit) {
        return false;
      }
      return true;
    },
    {
      message: "Deposit percentage is required when deposit is required",
      path: ["percentageDeposit"],
    }
  );

// Type inference from schema - this is the SINGLE source of truth
export type ProviderProfileFormData = z.infer<typeof providerProfileFormSchema>;

// For update operations, make most fields optional
export const updateProviderProfileFormSchema =
  providerProfileFormSchema.partial({
    businessName: true,
    isCompanyTrained: true,
    serviceOfferings: true,
    providerContactInfo: true,
    locationData: true,
    isAlwaysAvailable: true,
    workingHours: true,
    requireInitialDeposit: true,
    percentageDeposit: true,
  });

export type UpdateProviderProfileFormData = z.infer<
  typeof updateProviderProfileFormSchema
>;
