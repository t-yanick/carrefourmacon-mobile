import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:5000/api/v1';

export const APP_CONFIG = {
  apiUrl: API_URL,
  apiTimeout: 30000, // 30 seconds
  tokenKey: '@carrefourmacon:token',
  userKey: '@carrefourmacon:user',
} as const;

export const PHONE_CONFIG = {
  countryCode: '+237', // Cameroon
  minLength: 9,
  maxLength: 9,
} as const;

export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
} as const;