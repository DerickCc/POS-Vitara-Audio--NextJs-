import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { PurchaseReturnModel } from '@/models/purchase-return.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browsePr = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<PurchaseReturnModel>> => {
  try {
    const response = await apiFetch(
      `/api/purchase-returns${toQueryString({
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

export const getPrById = async (id: string): Promise<PurchaseReturnModel> => {
  try {
    const response = await apiFetch(`/api/purchase-returns/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const searchPr = async (name?: string): Promise<any[]> => {
  try {
    const response = await apiFetch(`/api/purchase-returns/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createPr = async (payload: PurchaseReturnModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/purchase-returns', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const finishPr = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-returns/${id}/finish`, {
      method: 'PUT',
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

export const cancelPr = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-returns/${id}/cancel`, {
      method: 'PUT',
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// EXCEL
export const exportPr = async ({ sortColumn, sortOrder, filters }: QueryParamsModel): Promise<void> => {
  try {
    const blob = await apiFetch(
      `/api/purchase-returns/export${toQueryString({ sortColumn, sortOrder, ...filters })}`,
      { method: 'GET' },
      'blob'
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'LaporanReturPembelian.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    throw e + '';
  }
};
