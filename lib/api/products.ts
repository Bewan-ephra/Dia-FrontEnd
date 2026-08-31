import { apiFetch } from "./client";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compare_price: string | null;
  stock: number;
  sku: string | null;
  category: { id: number; name: string };
  images?: { id: number; url: string; order: number }[];
  variants?: { id: number; attribute: string; value: string; price_adjustment: string; stock: number; sku: string | null }[];
}

interface ProductPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number | null;
  stock: number;
  sku?: string;
  category_id: number;
}

export async function getProducts(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await apiFetch(`/products${query}`);
  return response.data as Product[]; // "data" car la réponse Laravel est paginée
}

export async function deleteProduct(id: number) {
  return apiFetch(`/products/${id}`, { method: "DELETE" });
}


export async function getProduct(id: number) {
  return apiFetch(`/products/${id}`) as Promise<Product>;
}

export async function createProduct(data: ProductPayload) {
  return apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Product>;
}

export async function updateProduct(id: number, data: Partial<ProductPayload>) {
  return apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Product>;
}