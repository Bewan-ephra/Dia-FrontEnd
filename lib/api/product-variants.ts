import { apiFetch } from "./client";

export interface ProductVariant {
  id: number;
  color: string | null;
  size: string | null;
  label: string;
  price_adjustment: string;
  stock: number;
  sku: string | null;
}

interface VariantPayload {
  color?: string;
  size?: string;
  price_adjustment?: number;
  stock: number;
  sku?: string;
}

export async function createProductVariant(productId: number, data: VariantPayload) {
  return apiFetch(`/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<ProductVariant>;
}

export async function updateProductVariant(
  variantId: number,
  data: { stock?: number; price_adjustment?: number; sku?: string }
) {
  return apiFetch(`/product-variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<ProductVariant>;
}

export async function deleteProductVariant(variantId: number) {
  return apiFetch(`/product-variants/${variantId}`, { method: "DELETE" });
}