import { IncompletePaymentModel, LowStockProductModel, OverviewMetricsResult } from '@/models/dashboard.model';
import { PaginatedApiResponse, PagingModelWithoutFilter } from '@/models/global.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const getOverviewMetrics = async (): Promise<OverviewMetricsResult> => {
  try {
    const response = await apiFetch('/api/dashboard/overview-metrics', { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const browseIncompletePayment = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
}: PagingModelWithoutFilter): Promise<PaginatedApiResponse<IncompletePaymentModel>> => {
  try {
    const response = await apiFetch(
      `/api/dashboard/incomplete-payments${toQueryString({
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
      })}`,
      { method: 'GET' }
    );

    return response;
  } catch (e) {
    throw e + '';
  }
};

export const browseLowStockProduct = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
}: PagingModelWithoutFilter): Promise<PaginatedApiResponse<LowStockProductModel>> => {
  try {
    const response = await apiFetch(
      `/api/dashboard/low-stock-products${toQueryString({
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
      })}`,
      { method: 'GET' }
    );

    return response;
  } catch (e) {
    throw e + '';
  }
};
