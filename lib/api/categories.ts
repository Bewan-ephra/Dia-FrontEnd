import { apiFetch } from "./client";

export interface Category {
  id: number;
  name: string;
}

export async function getCategories() {
  return apiFetch("/categories") as Promise<Category[]>;
}