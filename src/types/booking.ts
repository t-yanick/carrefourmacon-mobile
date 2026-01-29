export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  status: BookingStatus;
  scheduledDate: string;
  description: string;
  estimatedPrice?: number;
  actualPrice?: number;
  paymentStatus: PaymentStatus;
  provider?: {
    id: string;
    businessName: string;
    profileImage?: string;
  };
  customer?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  providerId: string;
  scheduledAt: string;
  description: string;
  price?: number;
  location?: any;
  categoryId: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  actualPrice?: number;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer?: {
    fullName: string;
  };
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
}