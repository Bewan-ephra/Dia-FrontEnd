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
  user: { id: number; name: string } | null;
  vendor: { id: number; name: string } | null;
  items: OrderItem[];
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export async function getOrders(status?: string) {
  const query = status ? `?status=${status}` : "";
  return apiFetch(`/admin/orders${query}`) as Promise<PaginatedResponse<Order>>;
}

export async function updateOrderStatus(id: number, status: string) {
  return apiFetch(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }) as Promise<Order>;
}