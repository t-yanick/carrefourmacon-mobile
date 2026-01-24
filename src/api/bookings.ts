import { apiClient } from './client';
import {
  Booking,
  BookingListResponse,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  CreateReviewRequest,
  Review,
} from '@/types/booking';

export const bookingsApi = {
  // Create a new booking
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  // List user's bookings
  async listBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingListResponse> {
    const response = await apiClient.get<BookingListResponse>('/bookings', { params });
    return response.data;
  },

  // Get single booking
  async getBooking(id: string): Promise<Booking> {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // Update booking status (provider)
  async updateBookingStatus(id: string, data: UpdateBookingStatusRequest): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/status`, data);
    return response.data;
  },

  // Accept booking (provider)
  async acceptBooking(id: string): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/accept`);
    return response.data;
  },

  // Complete booking (provider)
  async completeBooking(id: string, actualPrice?: number): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/complete`, { actualPrice });
    return response.data;
  },

  // Cancel booking
  async cancelBooking(id: string): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Create review for completed booking
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },
};