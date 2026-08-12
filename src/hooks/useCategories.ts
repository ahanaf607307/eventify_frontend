import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  iconUrlPath?: string | null;
  isActive: boolean;
}

export function useCategories() {
  return useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/event-category');
      return res.data.data;
    },
  });
}

export function useCategory(id: string) {
  return useQuery<CategoryData>({
    queryKey: ['category', id],
    queryFn: async () => {
      const res = await api.get(`/event-category/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/event-category', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.patch(`/event-category/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/event-category/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
