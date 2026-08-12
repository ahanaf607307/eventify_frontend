import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStats {
  totalRevenue?: number;
  totalBookings?: number;
  totalEvents?: number;
  totalStaff?: number;
  totalSpent?: number;
  attendedBookings?: number;
  totalReviews?: number;
  todayCheckIns?: number;
  verifiedTickets?: number;
}

export interface ChartDataPoint {
  labels: string[];
  data: number[];
}

export interface DashboardOverviewResponse {
  stats: DashboardStats;
  chartData?: ChartDataPoint;
}

export function useDashboardOverview() {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await api.get('/dashboard/overview');
      return res.data.data;
    },
  });
}
