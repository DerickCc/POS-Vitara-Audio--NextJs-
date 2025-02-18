import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { PaymentModel } from '@/models/payment-history.model';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browsePo = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<PurchaseOrderModel>> => {
  try {
    const response = await apiFetch(
      `/api/purchase-orders${toQueryString({
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

export const getPoById = async (id: string): Promise<PurchaseOrderModel> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const searchPo = async (code?: string, progressStatus?: string): Promise<any[]> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/search${toQueryString({ code, progressStatus })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createPo = async (payload: PurchaseOrderModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/purchase-orders', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const updatePo = async (id: string, payload: PurchaseOrderModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

export const finishPo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}/finish`, {
      method: 'PUT',
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

export const cancelPo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}/cancel`, {
      method: 'PUT',
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// DELETE
export const deletePo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}`, { method: 'DELETE' });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// EXCEL
export const exportPo = async ({
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<void> => {
  try {
    const blob = await apiFetch(
      `/api/purchase-orders/export${toQueryString({ sortColumn, sortOrder, ...filters })}`,
      { method: 'GET' },
      'blob'
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'LaporanTransaksiPembelian.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    throw e + '';
  }
};