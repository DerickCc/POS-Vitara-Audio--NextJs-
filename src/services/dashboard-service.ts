import { apiFetch } from '@/utils/api';

// GET
export const getOverviewMetrics = async () => {
  try {
    const response = await apiFetch('/api/dashboard/overview-metrics', { method: 'GET' });
    return response;
  } catch (e) {
    throw e + '';
  }
};
