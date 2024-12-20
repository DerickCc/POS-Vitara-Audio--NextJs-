import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { ProductCurrPriceModel, ProductHistoryModel, ProductModel, SearchProductModel } from '@/models/product.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browseProduct = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<ProductModel>> => {
  try {
    const response = await apiFetch(
      `/api/products${toQueryString({
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

export const getProductById = async (id: string): Promise<ProductModel> => {
  try {
    const response = await apiFetch(`/api/products/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// last bought (supplier) or sold price (customer)
export const getProductLastPriceById = async ({
  productId,
  supOrCusId,
  type,
}: {
  productId: string;
  supOrCusId: string;
  type: 'supplier' | 'customer';
}): Promise<number> => {
  try {
    const response = await apiFetch(`/api/products/${productId}/last-price${toQueryString({ type, supOrCusId })}`, {
      method: 'GET',
    });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const getProductCurrCostPriceById = async (id: string): Promise<ProductCurrPriceModel> => {
  try {
    const response = await apiFetch(`/api/products/${id}/current-cost-price`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const searchProduct = async (name?: string): Promise<SearchProductModel[]> => {
  try {
    const response = await apiFetch(`/api/products/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

export const browseProductHistories = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<ProductHistoryModel>> => {
  try {
    const response = await apiFetch(
      `/api/products/${filters?.productId}/history${toQueryString({ pageSize, pageIndex, sortColumn, sortOrder })}`,
      {
        method: 'GET',
      }
    );
    return response;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createProduct = async (payload: ProductModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/products', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const updateProduct = async (id: string, payload: ProductModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// DELETE
export const deleteProduct = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};
