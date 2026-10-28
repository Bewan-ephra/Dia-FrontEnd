import { apiFetch } from "./client";

export interface CustomRequest {
  id: number;
  title: string;
  description: string;
  size_info: string | null;
  color: string | null;
  quantity: number;
  desired_date: string | null;
  images: string[];
  status: string;
  quoted_price: string | null;
  lead_time_days: number | null;
  admin_note: string | null;
  quoted_at: string | null;
  order_id: number | null;
  created_at: string;
  product?: { id: number; name: string } | null;
  user?: { id: number; name: string; email: string; phone: string | null } | null;
  valid_until: string | null;
  is_expired: boolean;
}

export interface CustomRequestsPage {
  data: CustomRequest[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface QuotePreview {
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  deposit_amount: number;
  balance: number;
  free_shipping_from: number;
}

export interface AcceptPayload {
  expected_price: number;
  delivery_mode: string;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address?: string;
  shipping_city?: string;
}

// ---------- Client ----------

export async function getMyCustomRequests(page = 1) {
  return apiFetch(
    `/custom-requests${page > 1 ? `?page=${page}` : ""}`
  ) as Promise<CustomRequestsPage>;
}

export async function getMyCustomRequest(id: number) {
  return apiFetch(`/custom-requests/${id}`) as Promise<CustomRequest>;
}

export async function createCustomRequest(form: FormData) {
  return apiFetch("/custom-requests", { method: "POST", body: form }) as Promise<CustomRequest>;
}

export async function previewCustomRequest(
  id: number,
  payload: { delivery_mode: string; payment_method: string | null }
) {
  return apiFetch(`/custom-requests/${id}/preview`, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<QuotePreview>;
}

export async function acceptCustomRequest(id: number, payload: AcceptPayload) {
  return apiFetch(`/custom-requests/${id}/accept`, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{ order: any; whatsapp_link: string | null }>;
}

export async function cancelCustomRequest(id: number) {
  return apiFetch(`/custom-requests/${id}/cancel`, { method: "POST" }) as Promise<CustomRequest>;
}

// ---------- Admin ----------

export async function getAdminCustomRequests({
  status,
  search,
  page,
}: { status?: string; search?: string; page?: number } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();

  return apiFetch(`/admin/custom-requests${query ? `?${query}` : ""}`) as Promise<CustomRequestsPage>;
}

export async function getAdminCustomRequest(id: number) {
  return apiFetch(`/admin/custom-requests/${id}`) as Promise<CustomRequest>;
}

export async function quoteCustomRequest(
  id: number,
  data: { quoted_price: number; lead_time_days?: number | null; valid_days?: number | null; admin_note?: string | null }
) {
  return apiFetch(`/admin/custom-requests/${id}/quote`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<CustomRequest>;
}

export async function rejectCustomRequest(id: number, admin_note: string) {
  return apiFetch(`/admin/custom-requests/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ admin_note }),
  }) as Promise<CustomRequest>;
}