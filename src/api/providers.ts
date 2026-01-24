import { apiClient } from './client';
import {
  Provider,
  ProviderListResponse,
  ServiceCategory,
  CreateProviderRequest,
  UpdateProviderRequest,
} from '@/types/provider';
import { Review } from '@/types/booking';

export const providersApi = {
  // Get all service categories
  async getCategories(): Promise<ServiceCategory[]> {
    const response = await apiClient.get<ServiceCategory[]>('/categories');
    return response.data;
  },

  // List all providers with optional filters
  async listProviders(params?: {
    categoryId?: string;
    city?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProviderListResponse> {
    const response = await apiClient.get<ProviderListResponse>('/providers', { params });
    return response.data;
  },

  // Get single provider by ID
  async getProvider(id: string): Promise<Provider> {
    const response = await apiClient.get<Provider>(`/providers/${id}`);
    return response.data;
  },

  // Get provider reviews
  async getProviderReviews(providerId: string): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/providers/${providerId}/reviews`);
    return response.data;
  },

  // Create provider profile (for providers)
  async createProvider(data: CreateProviderRequest): Promise<Provider> {
    const response = await apiClient.post<Provider>('/providers', data);
    return response.data;
  },

  // Update provider profile (for providers)
  async updateProvider(id: string, data: UpdateProviderRequest): Promise<Provider> {
    const response = await apiClient.patch<Provider>(`/providers/${id}`, data);
    return response.data;
  },
};