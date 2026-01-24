import { apiClient } from './client';
import {
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  User,
} from '@/types/user';

export const authApi = {
  // Send OTP to phone number
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>('/auth/send-otp', data);
    return response.data;
  },

  // Verify OTP and login/register
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>('/auth/verify-otp', data);
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', data);
    return response.data;
  },
};