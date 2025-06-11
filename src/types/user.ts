export interface User {
  id: string;
  email: string;
  role: "admin" | "desk";
  createdAt: number;
  createdBy: string;
  isFirstLogin: boolean;
  isActive: boolean;
  lastLoginAt?: number;
  tempPassword?: string;
}

export interface CreateUserRequest {
  email: string;
  role: "admin" | "desk";
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
