import { apiFetch } from "./client";

export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: { id: number; name: string }[];
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export async function getUsers(role?: string) {
  const query = role ? `?role=${role}` : "";
  return apiFetch(`/admin/users${query}`) as Promise<PaginatedResponse<UserWithRoles>>;
}