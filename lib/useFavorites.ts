"use client";
import { useEffect, useState } from "react";
import { getFavoriteIds, toggleFavorite } from "@/lib/api";

export function useFavoriteIds() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    getFavoriteIds().then(setIds).catch(() => {});
  }, []);

  async function toggle(e: React.MouseEvent, product: any) {
    e.preventDefault();
    const wasFavorite = ids.includes(product.id);

    setIds((prev) =>
      wasFavorite ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );

    try {
      await toggleFavorite(product, wasFavorite);
    } catch {
      setIds((prev) =>
        wasFavorite ? [...prev, product.id] : prev.filter((id) => id !== product.id)
      );
    }
  }

  return { ids, toggle };
}