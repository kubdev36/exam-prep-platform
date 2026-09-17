import { apiClient, MOCK_DASHBOARD } from '@/lib/api';
import { DashboardSummary } from '@/types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    } catch {
      return MOCK_DASHBOARD;
    }
  },
};
