import httpClient from './http.service';
import type {
  RoleOption,
  UserListItem,
  UserById,
  UserListQuery,
  PagedResult,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user.types';

export const UserService = {
  async getUsers(query: UserListQuery): Promise<PagedResult<UserListItem>> {
    const params = new URLSearchParams();
    if (query.search)              params.set('search',   query.search);
    if (query.roleId)              params.set('roleId',   String(query.roleId));
    if (query.isActive !== undefined) params.set('isActive', String(query.isActive));
    if (query.sortBy)              params.set('sortBy',   query.sortBy);
    if (query.sortDir)  params.set('sortDir',  query.sortDir);
    if (query.page)     params.set('page',     String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));

    const { data } = await httpClient.get<PagedResult<UserListItem>>(
      `/users?${params.toString()}`,
    );
    return data;
  },

  async getRoles(): Promise<RoleOption[]> {
    const { data } = await httpClient.get<RoleOption[]>('/users/roles');
    return data;
  },

  async getUserById(id: number): Promise<UserById> {
    const { data } = await httpClient.get<UserById>(`/users/${id}`);
    return data;
  },

  async createUser(request: CreateUserRequest): Promise<UserListItem> {
    const { data } = await httpClient.post<UserListItem>('/users', request);
    return data;
  },

  async updateUser(id: number, request: UpdateUserRequest): Promise<UserListItem> {
    const { data } = await httpClient.put<UserListItem>(`/users/${id}`, request);
    return data;
  },

  async deleteUser(id: number): Promise<void> {
    await httpClient.delete(`/users/${id}`);
  },
};
