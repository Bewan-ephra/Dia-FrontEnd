import { apiFetch } from "./client";
import type { ProductImage } from "./product-images";
import type { ProductVariant } from "./product-variants";

export interface ProductDetails {
  summary?: string;
  specs?: { label: string; value: string }[];
  features?: string[];
  benefits?: { icon: string; title: string; description: string }[];
  idealFor?: string[];
  care?: { label: string; value: string }[];
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  verified_purchase: boolean;
  user: { name: string };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compare_price: string | null;
  stock: number;
  available_stock: number;
  has_variants: boolean;
  sku: string | null;
  is_active: boolean;
  on_order: boolean;
  lead_time_days: number | null;
  details: ProductDetails | null;
  category: { id: number; name: string; slug: string };
  vendor?: { id: number; name: string } | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  average_rating: number | null;
  reviews_count: number;
}

interface ProductPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number | null;
  stock?: number;
  sku?: string;
  category_id: number;
  on_order?: boolean;
  lead_time_days?: number | null;
  details?: ProductDetails | null;
  is_active?: boolean;
}

export async function getProducts(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await apiFetch(`/products${query}`);
  return response.data as Product[];
}

function unwrap<T>(response: unknown): T {
  const r = response as { data?: T };
  return (r?.data ?? response) as T;
}

export async function getProduct(id: number) {
  return unwrap<Product>(await apiFetch(`/products/${id}`));
}

export async function createProduct(data: ProductPayload) {
  return unwrap<Product>(
    await apiFetch("/products", { method: "POST", body: JSON.stringify(data) })
  );
}

export async function updateProduct(id: number, data: Partial<ProductPayload>) {
  return unwrap<Product>(
    await apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) })
  );
}

export async function deleteProduct(id: number) {
  return apiFetch(`/products/${id}`, { method: "DELETE" });
}

export interface AdminProductsPage {
  data: Product[];
  meta: { current_page: number; last_page: number; total: number };
}

export async function getAdminProducts({
  search,
  status,
  page,
}: { search?: string; status?: string; page?: number } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();

  return apiFetch(`/admin/products${query ? `?${query}` : ""}`) as Promise<AdminProductsPage>;
}