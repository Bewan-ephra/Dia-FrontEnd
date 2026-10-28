import { apiFetch } from "./client";

export interface ProductImage {
  id: number;
  url: string;
  order: number;
  color: string | null;
}

export async function uploadProductImage(
  productId: number,
  file: File,
  order: number = 0,
  color: string | null = null
) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("order", String(order));
  if (color) formData.append("color", color);

  return apiFetch(`/products/${productId}/images`, {
    method: "POST",
    body: formData,
  }) as Promise<ProductImage>;
}

export async function deleteProductImage(imageId: number) {
  return apiFetch(`/product-images/${imageId}`, { method: "DELETE" });
}