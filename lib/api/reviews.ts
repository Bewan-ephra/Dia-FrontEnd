import { apiFetch } from "./client";
import type { PaginatedResponse } from "./orders";

export interface AdminReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  verified_purchase: boolean;
  product: { id: number; name: string } | null;
  user: { id: number; name: string; email: string } | null;
}

export async function getAdminReviews({
  rating,
  search,
  page,
}: { rating?: string; search?: string; page?: number } = {}) {
  const params = new URLSearchParams();
  if (rating) params.set("rating", rating);
  if (search) params.set("search", search);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();

  return apiFetch(`/admin/reviews${query ? `?${query}` : ""}`) as Promise<PaginatedResponse<AdminReview>>;
}

export async function deleteReview(id: number) {
  return apiFetch(`/reviews/${id}`, { method: "DELETE" });
}