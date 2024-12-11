import { PaginatedApiResponse, QueryParamsModel } from '@/models/global.model';
import { CreateUpdateUserModel, UserModel } from '@/models/user.model';
import { apiFetch, toQueryString } from '@/utils/api';

// GET
export const browseUser = async ({
  pageSize,
  pageIndex,
  sortColumn,
  sortOrder,
  filters,
}: QueryParamsModel): Promise<PaginatedApiResponse<UserModel>> => {
  try {
    const response = await apiFetch(
      `/api/users${toQueryString({
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

export const getUserById = async (id: string): Promise<UserModel> => {
  try {
    const response = await apiFetch(`/api/users/${id}`, { method: 'GET' });
    return response.result;
  } catch (e) {
    throw e + '';
  }
};

// POST
export const createUser = async (payload: CreateUpdateUserModel): Promise<string> => {
  try {
    const response = await apiFetch('/api/users', {
      method: 'POST',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

// PUT
export const updateUser = async (id: string, payload: CreateUpdateUserModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};

export const changeUserStatus = async (id: string): Promise<string> => {
  try {
    const response = await apiFetch(`/api/users/${id}/change-status`, { method: 'PUT' });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};
