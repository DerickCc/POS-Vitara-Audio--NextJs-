import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { PaymentModel } from '@/models/payment-history.model';
import { SalesOrderModel } from '@/models/sales-order';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browseSo = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<SalesOrderModel>> => {
  try {
    const response = await apiFetch(
      `/api/sales-orders${toQueryString({
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

export const getNewSoCode = async (): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/new-so-code`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const getSoById = async (id: string): Promise<SalesOrderModel> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const searchSo = async (code?: string, status?: string): Promise<any[]> => {
  try {
    const response = await apiFetch(`/api/sales-orders/search${toQueryString({ code, status })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createSo = async (payload: SalesOrderModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/sales-orders', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const updateSo = async (id: string, payload: SalesOrderModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

export const updateSoPayment = async (payload: PaymentModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${payload.id}/payment`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

export const cancelSo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${id}/cancel`, {
      method: 'PUT',
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// EXCEL
export const exportSo = async ({
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<void> => {
  try {
    const blob = await apiFetch(
      `/api/sales-orders/export${toQueryString({ sortColumn, sortOrder, ...filters })}`,
      { method: 'GET' },
      'blob'
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'LaporanTransaksiPenjualan.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    throw e + '';
  }
};