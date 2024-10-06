import { PaginatedApiResponse, PagingModel } from "@/models/global.model";
import { PurchaseOrderModel } from "@/models/purchase-order.model";
import { apiFetch, toQueryString } from "@/utils/api";

// GET
export const browsePo = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: PagingModel): Promise<PaginatedApiResponse<PurchaseOrderModel>> => {
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
    throw new Error(e + '');
  }
};

export const getPoById = async (id: string): Promise<PurchaseOrderModel> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw new Error(e + '');
  }
}

export const searchPo = async (name?: string): Promise<any[]> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw new Error(e + '');
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
    throw new Error(e + '');
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
    throw new Error(e + '');
  }
};

export const cancelPo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}/cancel`, {
      method: 'PUT'
    });
    return response.message;
  } catch (e) {
    throw new Error(e + '');
  }
};

// DELETE
export const deletePo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/purchase-orders/${id}`, { method: 'DELETE' });
    return response.message;
  } catch (e) {
    throw new Error(e + '');
  }
};
