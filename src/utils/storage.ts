import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';
import { User } from '@/types/user';

export const storage = {
  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(APP_CONFIG.tokenKey);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(APP_CONFIG.tokenKey, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(APP_CONFIG.tokenKey);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // User management
  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(APP_CONFIG.userKey);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(APP_CONFIG.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(APP_CONFIG.userKey);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([APP_CONFIG.tokenKey, APP_CONFIG.userKey]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};