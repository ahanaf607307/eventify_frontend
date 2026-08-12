import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ActivityLogData {
  id: string;
  userId: string;
  user?: { name: string; email: string };
  action: string;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export function useMyActivityLogs() {
  return useQuery<ActivityLogData[]>({
    queryKey: ['my-activity-logs'],
    queryFn: async () => {
      const res = await api.get('/activity-logs/my-logs');
      return res.data.data;
    },
  });
}

export function useAllActivityLogs() {
  return useQuery<ActivityLogData[]>({
    queryKey: ['all-activity-logs'],
    queryFn: async () => {
      const res = await api.get('/activity-logs');
      return res.data.data;
    },
  });
}
