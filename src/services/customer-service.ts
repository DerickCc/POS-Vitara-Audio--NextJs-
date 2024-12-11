import { CustomerModel, SearchCustomerModel } from '@/models/customer.model';
import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browseCustomer = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<CustomerModel>> => {
  try {
    const response = await apiFetch(
      `/api/customers${toQueryString({
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

export const getCustomerById = async (id: string): Promise<CustomerModel> => {
  try {
    const response = await apiFetch(`/api/customers/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const searchCustomer = async (name?: string): Promise<SearchCustomerModel[]> => {
  try {
    const response = await apiFetch(`/api/customers/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createCustomer = async (payload: CustomerModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/customers', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const updateCustomer = async (id: string, payload: CustomerModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/customers/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// DELETE
export const deleteCustomer = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};
