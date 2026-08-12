import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EventStatus } from '@/lib/config';

export interface EventHighlight {
  dressCode?: string;
  workshops?: number;
  wifiAvailable?: boolean;
  parkingFacility?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
}

export interface EventData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  about?: string | null;
  ticketPrice: number;
  location: string;
  date: string;
  time: string;
  eventHighlight?: EventHighlight | null;
  seatCount: number;
  availableSeats: number;
  bannerUrl?: string | null;
  bannerUrlPath?: string | null;
  images?: string[];
  status: EventStatus;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: EventCategory;
  createdAt: string;
}

interface EventsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  status?: string;
  sort?: string;
  maxPrice?: number;
  isFeatured?: boolean;
}

export function useEvents(params: EventsParams = {}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const res = await api.get('/events', { params });
      return res.data;
    },
  });
}

export function useEvent(id: string) {
  return useQuery<EventData>({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.patch(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/events/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
export type { EventsParams };
