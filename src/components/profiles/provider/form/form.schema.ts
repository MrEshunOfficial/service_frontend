// ============================================
// FILE: form.schema.ts (UPDATED)
// ============================================

import { z } from "zod";

// ============================================
// Enums
// ============================================

export const IdTypeEnum = z.enum([
  "national_id",
  "passport",
  "voters_id",
  "drivers_license",
  "nhis",
  "other",
]);

// ============================================
// Reusable Schemas
// ============================================

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const idDetailsSchema = z.object({
  idType: IdTypeEnum,
  idNumber: z.string().min(1, "ID number is required"),
  IdFile: z.array(z.string()).min(1, "At least one ID image is required"),
});

export const userLocationSchema = z.object({
  ghanaPostGPS: z
    .string()
    .min(1, "Ghana Post GPS is required")
    .regex(
      /^[A-Z]{2}-\d{3,4}-\d{4}$/,
      "Invalid Ghana Post GPS format (e.g., AK-039-5028)"
    ),
  nearbyLandmark: z.string().optional(),
  gpsCoordinates: coordinatesSchema.optional(),
});

export const contactDetailsSchema = z.object({
  primaryContact: z
    .string()
    .min(10, "Primary contact must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  secondaryContact: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  businessContact: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  businessEmail: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
});

export const workingHoursSchema = z
  .record(
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
  )
  .refine(
    (hours) => {
      return Object.values(hours).every(({ start, end }) => {
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      });
    },
    { message: "End time must be after start time" }
  );

// ============================================
// Main Provider Profile Schemas
// ============================================

export const createProviderProfileSchema = z
  .object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name must not exceed 100 characters")
      .optional(),

    IdDetails: idDetailsSchema.optional(),

    isCompanyTrained: z.boolean().default(false),

    serviceOfferings: z
      .array(z.string().min(1, "Invalid service ID"))
      .min(1, "At least one service must be selected"),

    BusinessGalleryImages: z
      .array(z.string())
      .max(10, "Maximum 10 gallery images allowed")
      .default([]), // ✅ FIXED: Removed .optional() - can't have both default and optional

    providerContactInfo: contactDetailsSchema,

    locationData: userLocationSchema,

    isAlwaysAvailable: z.boolean().default(false),

    workingHours: workingHoursSchema.optional(),

    requireInitialDeposit: z.boolean().default(false),

    percentageDeposit: z
      .number()
      .min(0, "Deposit percentage cannot be negative")
      .max(100, "Deposit percentage cannot exceed 100")
      .optional(),
  })
  .refine(
    (data) => {
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
      if (data.requireInitialDeposit && !data.percentageDeposit) {
        return false;
      }
      return true;
    },
    {
      message: "Deposit percentage is required when initial deposit is enabled",
      path: ["percentageDeposit"],
    }
  );

export const updateProviderProfileSchema = z
  .object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name must not exceed 100 characters")
      .optional(),

    IdDetails: idDetailsSchema.optional(),

    isCompanyTrained: z.boolean().optional(), // ✅ FIXED: Made optional for updates

    serviceOfferings: z
      .array(z.string().min(1, "Invalid service ID"))
      .optional(),

    BusinessGalleryImages: z
      .array(z.string())
      .max(10, "Maximum 10 gallery images allowed")
      .optional(),

    providerContactInfo: contactDetailsSchema.optional(),

    locationData: userLocationSchema.optional(),

    isAlwaysAvailable: z.boolean().optional(),

    workingHours: workingHoursSchema.optional(),

    requireInitialDeposit: z.boolean().optional(),

    percentageDeposit: z
      .number()
      .min(0, "Deposit percentage cannot be negative")
      .max(100, "Deposit percentage cannot exceed 100")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.requireInitialDeposit && data.percentageDeposit === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Deposit percentage is required when initial deposit is enabled",
      path: ["percentageDeposit"],
    }
  );

// ============================================
// Type Inference
// ============================================

export type CreateProviderProfileInput = z.infer<
  typeof createProviderProfileSchema
>;
export type UpdateProviderProfileInput = z.infer<
  typeof updateProviderProfileSchema
>;
export type ContactDetailsInput = z.infer<typeof contactDetailsSchema>;
export type UserLocationInput = z.infer<typeof userLocationSchema>;
export type IdDetailsInput = z.infer<typeof idDetailsSchema>;
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;

// ============================================
// Helper Schemas for Specific Form Steps
// ============================================

export const basicInfoSchema = createProviderProfileSchema.pick({
  businessName: true,
  isCompanyTrained: true,
  serviceOfferings: true,
});

export const contactInfoSchema = createProviderProfileSchema.pick({
  providerContactInfo: true,
});

export const locationInfoSchema = createProviderProfileSchema.pick({
  locationData: true,
});

export const availabilitySchema = createProviderProfileSchema.pick({
  isAlwaysAvailable: true,
  workingHours: true,
});

export const paymentSettingsSchema = createProviderProfileSchema.pick({
  requireInitialDeposit: true,
  percentageDeposit: true,
});

export const identityGallerySchema = createProviderProfileSchema.pick({
  IdDetails: true,
  BusinessGalleryImages: true,
});

export const addServiceSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
});

export const serviceSelectionSchema = z.object({
  selectedServices: z
    .array(z.string())
    .min(1, "At least one service must be selected"),
});
