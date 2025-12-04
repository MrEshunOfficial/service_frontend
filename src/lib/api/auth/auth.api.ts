// api/services/auth.api.ts

import { APIClient } from "../base/api-client";
import {
  SignupData,
  AuthResponse,
  LoginData,
  VerifyEmailData,
  ResendVerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  StatusResponse,
  RestoreAccountData,
  VerifyAccessResponse,
  GetUsersParams,
  PaginatedUsersResponse,
  UpdateUserRoleData,
  HealthCheckResponse,
} from "@/types/user.types";

export class AuthAPI extends APIClient {
  private readonly endpoint = "/api/auth";

  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  async signup(userData: SignupData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/signup`, userData);
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/login`, credentials);
  }

  async logout(): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/logout`);
  }

  // ============================================
  // EMAIL VERIFICATION ENDPOINTS
  // ============================================

  async verifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/verify-email`, data);
  }

  async resendVerification(
    data: ResendVerificationData
  ): Promise<AuthResponse> {
    return this.post<AuthResponse>(
      `${this.endpoint}/resend-verification`,
      data
    );
  }

  // ============================================
  // PASSWORD MANAGEMENT ENDPOINTS
  // ============================================

  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/forgot-password`, data);
  }

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/reset-password`, data);
  }

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/change-password`, data);
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  async refreshToken(): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/refresh-token`);
  }

  // ============================================
  // USER PROFILE ENDPOINTS
  // ============================================

  async getCurrentUser(): Promise<AuthResponse> {
    return this.get<AuthResponse>(`${this.endpoint}/me`);
  }

  async getAuthStatus(): Promise<StatusResponse> {
    return this.get<StatusResponse>(`${this.endpoint}/status`);
  }

  // ============================================
  // ACCOUNT MANAGEMENT ENDPOINTS
  // ============================================

  async deleteAccount(): Promise<AuthResponse> {
    return this.delete<AuthResponse>(`${this.endpoint}/account`);
  }

  async restoreAccount(data: RestoreAccountData): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.endpoint}/restore-account`, data);
  }

  // ============================================
  // ACCESS VERIFICATION ENDPOINTS
  // ============================================

  async verifyEmailAccess(): Promise<VerifyAccessResponse> {
    return this.get<VerifyAccessResponse>(
      `${this.endpoint}/verify-access/verified`
    );
  }

  async verifyAdminAccess(): Promise<VerifyAccessResponse> {
    return this.get<VerifyAccessResponse>(
      `${this.endpoint}/verify-access/admin`
    );
  }

  async verifySuperAdminAccess(): Promise<VerifyAccessResponse> {
    return this.get<VerifyAccessResponse>(
      `${this.endpoint}/verify-access/super-admin`
    );
  }

  // ============================================
  // ADMIN ENDPOINTS - User Management
  // ============================================

  async getAllUsers(params?: GetUsersParams): Promise<PaginatedUsersResponse> {
    return this.get<PaginatedUsersResponse>(
      `${this.endpoint}/admin/users`,
      params
    );
  }

  async getUserById(userId: string): Promise<AuthResponse> {
    return this.get<AuthResponse>(`${this.endpoint}/admin/users/${userId}`);
  }

  // ============================================
  // SUPER ADMIN ENDPOINTS
  // ============================================

async updateUserRole(
  userId: string | undefined,
  data: UpdateUserRoleData
): Promise<AuthResponse> {
  // Add validation
  if (!userId || userId === 'undefined') {
    throw new Error('Valid user ID is required for updating role');
  }
  
  console.log('Updating user role:', { userId, data }); // Debug log
  
  return this.patch<AuthResponse>(
    `${this.endpoint}/admin/users/${userId}/role`,
    data
  );
}

  async deleteUser(userId: string): Promise<AuthResponse> {
    return this.delete<AuthResponse>(`${this.endpoint}/admin/users/${userId}`);
  }

  async restoreUser(userId: string): Promise<AuthResponse> {
    return this.post<AuthResponse>(
      `${this.endpoint}/admin/users/${userId}/restore`
    );
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.get<HealthCheckResponse>(`${this.endpoint}/health`);
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
