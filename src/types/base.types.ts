// types/base.types.ts
import { Types } from "mongoose";

export interface BaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

// ✅ Fixed: Added _id and fileId as optional fields
export interface FileReference {
  _id?: string; // MongoDB ID
  fileId?: string; // Alternative ID field
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: Date;
  extension?: string;
  thumbnailUrl?: string;
  uploaderId?: Types.ObjectId;
  storageProvider?: "local" | "s3" | "cloudinary" | "gcs" | "mega";
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation {
  ghanaPostGPS: string;
  nearbyLandmark?: string;
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
  streetName?: string;
  houseNumber?: string;
  gpsCoordinates?: Coordinates;
  isAddressVerified?: boolean;
  sourceProvider?: "openstreetmap" | "google" | "ghanapost";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SocialMediaHandle {
  nameOfSocial: string;
  userName: string;
  profileUrl?: string;
}

export interface ContactDetails {
  primaryContact: string;
  secondaryContact?: string;
  businessContact?: string;
  businessEmail?: string;
}

export enum idType {
  NATIONAL_ID = "national_id",
  PASSPORT = "passport",
  VOTERS_ID = "voters_id",
  DRIVERS_LICENSE = "drivers_license",
  NHIS = "nhis",
  OTHER = "other",
}

export interface IdDetails {
  idType: idType;
  idNumber: string;
  idFile: FileReference;
}

export enum UserRole {
  CUSTOMER = "customer",
  PROVIDER = "service_provider",
}

export enum SystemRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum AuthProvider {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
  APPLE = "apple",
}
