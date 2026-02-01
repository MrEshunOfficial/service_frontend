import * as z from "zod";
import { idType } from "@/types/base.types";

const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ghanaPostGPSRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;

const timeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
}).refine(
  (data) => {
    const [startHour, startMin] = data.start.split(":").map(Number);
    const [endHour, endMin] = data.end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  { message: "End time must be after start time" }
);

const workingHoursSchema = z.object({
  monday: timeSlotSchema.optional(),
  tuesday: timeSlotSchema.optional(),
  wednesday: timeSlotSchema.optional(),
  thursday: timeSlotSchema.optional(),
  friday: timeSlotSchema.optional(),
  saturday: timeSlotSchema.optional(),
  sunday: timeSlotSchema.optional(),
});

const contactDetailsSchema = z.object({
  primaryContact: z
    .string()
    .min(1, "Primary contact is required")
    .regex(phoneRegex, "Invalid Ghana phone number format"),
  secondaryContact: z
    .string()
    .regex(phoneRegex, "Invalid Ghana phone number format")
    .optional()
    .or(z.literal("")),
  businessContact: z
    .string()
    .regex(phoneRegex, "Invalid Ghana phone number format")
    .optional()
    .or(z.literal("")),
  businessEmail: z
    .string()
    .regex(emailRegex, "Invalid email format")
    .optional()
    .or(z.literal("")),
});

const locationDataSchema = z.object({
  // User-provided fields (required)
  ghanaPostGPS: z
    .string()
    .min(1, "Ghana Post GPS is required")
    .regex(ghanaPostGPSRegex, "Invalid Ghana Post GPS format (e.g., GA-1234-5678)"),
  nearbyLandmark: z.string().optional().or(z.literal("")),
  
  // Auto-generated fields (optional, filled by backend after verification)
  region: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  locality: z.string().optional().or(z.literal("")),
  streetName: z.string().optional().or(z.literal("")),
  houseNumber: z.string().optional().or(z.literal("")),
  
  // Technical fields (auto-generated)
  gpsCoordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  isAddressVerified: z.boolean().optional(),
  sourceProvider: z.enum(["openstreetmap", "google", "ghanapost"]).optional(),
});

// Completely optional ID details - no validation when empty
const idDetailsSchema = z.object({
  idType: z.nativeEnum(idType).optional(),
  idNumber: z.string().optional(),
  idImages: z.array(z.string()).optional(),
}).optional();

export const providerProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  isCompanyTrained: z.boolean(),
  providerContactInfo: contactDetailsSchema,
  locationData: locationDataSchema,
  IdDetails: idDetailsSchema,
  serviceOfferings: z.array(z.string()).min(1, "At least one service is required"),
  BusinessGalleryImages: z.array(z.string()).optional(),
  isAlwaysAvailable: z.boolean(),
  workingHours: workingHoursSchema.optional(),
  requireInitialDeposit: z.boolean(),
  percentageDeposit: z
    .number()
    .min(0, "Deposit percentage must be at least 0")
    .max(100, "Deposit percentage cannot exceed 100")
    .optional(),
}).refine(
  (data) => {
    // Only validate working hours if user explicitly chose NOT to be always available
    if (!data.isAlwaysAvailable) {
      const hasWorkingHours = data.workingHours && 
        Object.values(data.workingHours).some(slot => slot !== undefined);
      return hasWorkingHours;
    }
    return true;
  },
  {
    message: "Please set your working hours or mark yourself as always available",
    path: ["workingHours"],
  }
).refine(
  (data) => {
    // Only validate deposit percentage if user explicitly requires deposit
    if (data.requireInitialDeposit) {
      return data.percentageDeposit !== undefined && data.percentageDeposit > 0;
    }
    return true;
  },
  {
    message: "Deposit percentage is required when initial deposit is enabled",
    path: ["percentageDeposit"],
  }
);
// REMOVED: The ID details validation that forced completion of all fields
// The backend will handle profile association, so we don't validate ID on frontend

export type ProviderProfileFormData = z.infer<typeof providerProfileSchema>;