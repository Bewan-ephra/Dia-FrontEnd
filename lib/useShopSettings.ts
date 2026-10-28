"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export interface ShopSettings {
  shipping_fee: number;
  free_shipping_from: number;
  deposit_rate: number;
  whatsapp: string;
  pickup_label: string;
  pickup_note: string;
}

// Valeurs affichées le temps que le serveur réponde (ou s'il est injoignable)
const FALLBACK: ShopSettings = {
  shipping_fee: 2000,
  free_shipping_from: 50000,
  deposit_rate: 0.5,
  whatsapp: "24160348225",
  pickup_label: "NZENG-AYONG, Carrefour GP",
  pickup_note: "Habituellement prête en 1 heure",
};

let cache: ShopSettings | null = null;
let pending: Promise<ShopSettings> | null = null;

function load() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = apiFetch("/shop-settings", {}, { redirectOn401: false })
      .then((s) => (cache = s as ShopSettings))
      .catch(() => {
        pending = null; // on réessaiera au prochain affichage
        return FALLBACK;
      });
  }
  return pending;
}

export function useShopSettings(): ShopSettings {
  const [settings, setSettings] = useState<ShopSettings>(FALLBACK);

  useEffect(() => {
    let alive = true;
    load().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}