import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookingStatus, PaymentStatus } from '@/lib/config';

export interface BookingData {
  id: string;
  bookingCode: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  eventId: string;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    bannerUrl?: string | null;
    category?: { name: string };
  };
  seatCount: number;
  unitPrice: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export function useMyBookings() {
  return useQuery<BookingData[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/user/booking/my-bookings');
      return res.data.data;
    },
  });
}

export function useBooking(id: string) {
  return useQuery<BookingData>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/user/booking/my-bookings/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useAllBookings() {
  return useQuery<BookingData[]>({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data.data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      eventId: string;
      seatCount: number;
      paymentMethod: string;
      notes?: string;
    }) => {
      const res = await api.post('/user/booking/book', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.patch(`/user/booking/my-bookings/${id}/cancel`, {
        cancellationReason: reason || 'Cancelled by attendee',
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
    },
  });
}

export function useUpdateBookingStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { status?: BookingStatus; paymentStatus?: PaymentStatus }) => {
      const res = await api.patch(`/bookings/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/bookings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
    },
  });
}

export function useVerifyTicket() {
  return useMutation({
    mutationFn: async (bookingCode: string) => {
      const res = await api.post('/bookings/verify-ticket', { bookingCode });
      return res.data;
    },
  });
}
