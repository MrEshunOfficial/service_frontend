import { z } from "zod";
import { UserRole } from "@/types/base.types";

export const createProfileSchema = z.object({
  role: z
    .nativeEnum(UserRole)
    .refine((v) => v !== undefined && v !== null, "Please select a role"),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  mobileNumber: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Invalid phone number format"
    )
    .optional()
    .or(z.literal("")),
  profilePictureId: z.string().optional(),
});

export type CreateProfileFormData = z.infer<typeof createProfileSchema>;
