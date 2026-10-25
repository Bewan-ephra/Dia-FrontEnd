import { apiFetch } from "./client";
import type { PaginatedResponse } from "./orders";

export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  orders_count?: number;
  roles: { id: number; name: string }[];
}

export interface ClientDetail {
  user: UserWithRoles;
  total_spent: number;
  orders: {
    id: number;
    status: string;
    payment_status: string;
    total: string;
    created_at: string;
  }[];
}

interface UsersQuery {
  role?: string;
  search?: string;
  page?: number;
}

export async function getUsers({ role, search, page }: UsersQuery = {}) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (search) params.set("search", search);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();

  return apiFetch(`/admin/users${query ? `?${query}` : ""}`) as Promise<
    PaginatedResponse<UserWithRoles>
  >;
}

export async function getUserDetail(id: number) {
  return apiFetch(`/admin/users/${id}`) as Promise<ClientDetail>;
}