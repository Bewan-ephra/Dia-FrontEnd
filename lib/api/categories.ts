import { apiFetch } from "./client";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  products_count?: number;
  children?: Category[];
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
}

export async function getCategories() {
  return apiFetch("/categories") as Promise<Category[]>;
}

export async function getCategory(id: number) {
  return apiFetch(`/categories/${id}`) as Promise<Category>;
}

export async function createCategory(data: CategoryPayload) {
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Category>;
}

export async function updateCategory(id: number, data: Partial<CategoryPayload>) {
  return apiFetch(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Category>;
}

export async function deleteCategory(id: number) {
  return apiFetch(`/categories/${id}`, { method: "DELETE" });
}