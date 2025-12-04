// types/user.types.ts

// Updated response types based on new backend structure
export interface User {
  // Support both _id (MongoDB) and id (transformed response)
  _id?: string;
  id?: string;
  name: string;
  email: string;
  // Support both field names for email verification
  isEmailVerified?: boolean;
  isVerified?: boolean;
  systemRole: string;
  // Support both field names for auth provider
  authProvider?: string;
  provider?: string;
  systemAdminName: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  security: {
    passwordChangedAt?: string;
    lastLogin?: string;
    lastLoggedOut?: string;
  };
  // Support lastLogin at root level too (for backward compatibility)
  lastLogin?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  userId?: string;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
}

export interface PaginatedUsersResponse {
  message: string;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StatusResponse {
  isAuthenticated: boolean;
  user: User | null;
}

export interface VerifyAccessResponse {
  message: string;
  verified?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  user: {
    id?: string;
    name?: string;
    email?: string;
    isVerified?: boolean;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    systemRole?: string;
    systemAdminName?: string | null;
  };
}

export interface HealthCheckResponse {
  message: string;
  timestamp: string;
}

// Request body types
export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRoleData {
  systemRole: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface RestoreAccountData {
  email: string;
}