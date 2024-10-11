import { PaginatedApiResponse, PagingModel } from '@/models/global.model';
import { SearchSupplierModel, SupplierModel } from '@/models/supplier.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browseSupplier = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: PagingModel): Promise<PaginatedApiResponse<SupplierModel>> => {
  try {
    const response = await apiFetch(
      `/api/suppliers${toQueryString({
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

export const getSupplierById = async (id: string): Promise<SupplierModel> => {
  try {
    const response = await apiFetch(`/api/suppliers/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
  }
}

export const searchSupplier = async (name?: string): Promise<SearchSupplierModel[]> => {
  try {
    const response = await apiFetch(`/api/suppliers/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
  }
};

// POST
export const createSupplier = async (payload: SupplierModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/suppliers', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw (e + '');
  }
};

// PUT
export const updateSupplier = async (id: string, payload: SupplierModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw (e + '');
  }
};

// DELETE
export const deleteSupplier = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    return response.message;
  } catch (e) {
    throw (e + '');
  }
};
