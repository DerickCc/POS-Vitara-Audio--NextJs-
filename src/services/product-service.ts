import { PaginatedApiResponse, PagingModel } from "@/models/global.model";
import { ProductModel, SearchProductModel } from "@/models/product.model";
import { apiFetch, toQueryString } from "@/utils/api";

// GET
export const browseProduct = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: PagingModel): Promise<PaginatedApiResponse<ProductModel>> => {
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
    throw (e + '');
  }
};

export const getProductById = async (id: string): Promise<ProductModel> => {
  try {
    const response = await apiFetch(`/api/products/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
  }
}

export const searchProduct = async (name?: string): Promise<SearchProductModel[]> => {
  try {
    const response = await apiFetch(`/api/products/search${toQueryString({ name })}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw (e + '');
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
    throw (e + '');
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
    throw (e + '');
  }
};

// DELETE
export const deleteProduct = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    return response.message;
  } catch (e) {
    throw (e + '');
  }
};
