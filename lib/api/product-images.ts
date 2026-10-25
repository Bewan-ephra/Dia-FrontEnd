import { apiFetch } from "./client";

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  order: number;
}

export async function uploadProductImage(productId: number, file: File, order: number = 0) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("order", String(order));

  return apiFetch(`/products/${productId}/images`, {
    method: "POST",
    body: formData,
  }) as Promise<ProductImage>;
}

export async function deleteProductImage(imageId: number) {
  return apiFetch(`/product-images/${imageId}`, { method: "DELETE" });
}