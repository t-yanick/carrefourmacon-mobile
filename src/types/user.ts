export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SendOTPRequest {
  phoneNumber: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  user: User;
  token: string;
  isNewUser: boolean;
}