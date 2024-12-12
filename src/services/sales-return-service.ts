import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { SalesReturnModel } from '@/models/sales-return.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browseSr = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<SalesReturnModel>> => {
  try {
    const response = await apiFetch(
      `/api/sales-returns${toQueryString({
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
        ...filters,
      })}`,
      { method: 'GET' }
    );

    return response;
  } catch (e) {
    throw e + '';
  }
};

export const getSrById = async (id: string): Promise<SalesReturnModel> => {
  try {
    const response = await apiFetch(`/api/sales-returns/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const searchSr = async (name?: string): Promise<any[]> => {
  try {
    const response = await apiFetch(`/api/sales-returns/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createSr = async (payload: SalesReturnModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/sales-returns', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const cancelSr = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-returns/${id}/cancel`, {
      method: 'PUT',
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// EXCEL
export const exportSr = async ({ sortColumn, sortOrder, filters }: QueryParamsModel): Promise<void> => {
  try {
    const blob = await apiFetch(
      `/api/sales-returns/export${toQueryString({ sortColumn, sortOrder, ...filters })}`,
      { method: 'GET' },
      'blob'
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'LaporanReturPenjualan.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    throw e + '';
  }
};
