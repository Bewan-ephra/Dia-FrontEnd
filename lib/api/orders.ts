import { apiFetch } from "./client";

export interface OrderItem {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  vendor_id: number | null;
  status: string;
  payment_method: string;
  payment_status: string;
  total: string;
  discount: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  notes: string | null;
  created_at: string;
  user?: { id: number; name: string } | null;
  vendor?: { id: number; name: string } | null;
  items: OrderItem[];
  delivery_mode: string;
shipping_name: string | null;
shipping_fee: string;
deposit_amount: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

interface OrdersQuery {
  status?: string;
  payment_status?: string;
  search?: string;
  page?: number;
}

export async function getOrders({ status, payment_status, search, page }: OrdersQuery = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (payment_status) params.set("payment_status", payment_status);
  if (search) params.set("search", search);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();

  return apiFetch(`/admin/orders${query ? `?${query}` : ""}`) as Promise<PaginatedResponse<Order>>;
}

export async function getOrder(id: number) {
  return apiFetch(`/orders/${id}`) as Promise<Order>;
}

export async function updateOrder(
  id: number,
  data: { status?: string; payment_status?: string }
) {
  return apiFetch(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Order>;
}