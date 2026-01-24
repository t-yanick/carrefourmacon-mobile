export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  categories: ServiceCategory[];
  address: string;
  city: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isAvailable: boolean;
  profileImage?: string;
  coverImage?: string;
  priceRange?: string;
  yearsOfExperience?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderListResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProviderRequest {
  businessName: string;
  description: string;
  categoryIds: string[];
  address: string;
  city: string;
  priceRange?: string;
  yearsOfExperience?: number;
}

export interface UpdateProviderRequest {
  businessName?: string;
  description?: string;
  categoryIds?: string[];
  address?: string;
  city?: string;
  isAvailable?: boolean;
  priceRange?: string;
  yearsOfExperience?: number;
}