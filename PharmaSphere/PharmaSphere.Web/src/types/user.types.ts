export interface RoleOption {
  roleId: number;
  roleName: string;
}

export interface UserListItem {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleName: string;
  roleId: number;
  isActive: boolean;
}

export interface UserById {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number;
  isActive: boolean;
}

export type SortField = 'email' | 'firstName' | 'lastName';
export type SortDir = 'asc' | 'desc';

export interface UserListQuery {
  search?: string;
  roleId?: number;
  isActive?: boolean;
  sortBy?: SortField;
  sortDir?: SortDir;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number;
  isActive: boolean;
}

export interface UpdateUserRequest {
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number;
  isActive: boolean;
  password?: string;
}

// Helpers shared by list and form pages
export const encodeUserId = (id: number): string => btoa(String(id));
export const decodeUserId = (encoded: string): number | null => {
  try {
    const n = parseInt(atob(encoded), 10);
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
};
