import { apiFetch } from "./client";

export interface DashboardStats {
  total_users: number;
  total_clients: number;
  total_products: number;
  total_orders: number;
  orders_by_status: Record<string, number>;
  revenue_total: number;
  revenue_this_month: number;
  top_products: {
    product_id: number | null;
    product_name: string;
    total_sold: number;
  }[];
  recent_orders: {
    id: number;
    status: string;
    total: string;
    created_at: string;
    user: { id: number; name: string } | null;
    vendor: { id: number; name: string } | null;
  }[];
}

export async function getDashboardStats() {
  return apiFetch("/admin/stats") as Promise<DashboardStats>;
}