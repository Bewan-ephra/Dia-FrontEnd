import { getCategoryImage } from "@/lib/api";

// Vignette : photo générale du produit, sinon image de sa catégorie

export function productThumb(p: any): string | null {
  const direct = p?.image;
if (direct) return direct;
  const images = [...(p?.images ?? [])];
  const general = images.find((i: any) => !i.color) ?? images[0];
  return general?.url ?? getCategoryImage(p?.category?.name) ?? null;
}