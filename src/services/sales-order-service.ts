import { PaginatedApiResponse, PagingModel } from "@/models/global.model";
import { SalesOrderModel } from "@/models/sales-order";
import { apiFetch, toQueryString } from "@/utils/api";

// GET
export const browseSo = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: PagingModel): Promise<PaginatedApiResponse<SalesOrderModel>> => {
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
    throw (e + '');
  }
};

export const getNewSoCode = async (): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/new-so-code`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
  }
}

export const getSoById = async (id: string): Promise<SalesOrderModel> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
  }
}

export const searchSo = async (name?: string): Promise<any[]> => {
  try {
    const response = await apiFetch(`/api/sales-orders/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
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
    throw (e + '');
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
    throw (e + '');
  }
};

export const updateSoPayment = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${id}/payment`, {
      method: 'PUT'
    });
    return response.message;
  } catch (e) {
    throw (e + '');
  }
};

export const cancelSo = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/sales-orders/${id}/cancel`, {
      method: 'PUT'
    });
    return response.message;
  } catch (e) {
    throw (e + '');
  }
};

// // DELETE
// export const deleteSo = async (id: string): Promise<string> => {
//   try {
//     const response = await apiFetch(`/api/sales-orders/${id}`, { method: 'DELETE' });
//     return response.message;
//   } catch (e) {
//     throw (e + '');
//   }
// };
