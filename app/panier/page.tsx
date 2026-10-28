"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Photo from "@/components/Photo";
import { getCart, removeFromCart, updateCartItem } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function PanierPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }

    getCart(token)
      .then(setCart)
      .catch((err: Error) => {
        if (err.message.startsWith("Session expirée")) {
          router.push("/connexion");
        } else {
          setError(err.message || "Impossible de charger le panier.");
        }
      });
  }, [router]);

  async function reload() {
    const token = localStorage.getItem("token")!;
    setCart(await getCart(token));
  }

  async function handleUpdateQuantity(item: any, newQuantity: number) {
    if (newQuantity < 1) return;
    if (item.available_stock !== null && newQuantity > item.available_stock) {
      setError(`Stock insuffisant : il reste ${item.available_stock} exemplaire(s) de ce produit.`);
      return;
    }

    const token = localStorage.getItem("token")!;
    setBusyId(item.id);
    setError(null);
    try {
      await updateCartItem(token, item.id, newQuantity);
      await reload(); // le serveur recalcule les totaux
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier la quantité.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(itemId: number) {
    const token = localStorage.getItem("token")!;
    setBusyId(itemId);
    setError(null);
    try {
      await removeFromCart(token, itemId);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de retirer l'article.");
    } finally {
      setBusyId(null);
    }
  }

  if (!cart) {
    return (
      <div className="p-8 text-gray-600">
        {error ?? "Chargement..."}
      </div>
    );
  }

  const items: any[] = cart.cart.items;
  const isEmpty = items.length === 0;
  const subtotal = Number(cart.total);
  const shipping = Number(cart.shipping_fee ?? 0);
const freeFrom = Number(cart.free_shipping_from ?? 0);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <h1 className="text-2xl text-center font-bold text-gray-900 mb-8">
            PANIER {!isEmpty && `(${items.length})`}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {isEmpty ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">
                Votre panier est actuellement vide
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Découvrez notre catalogue et trouvez des produits qui vous plaisent.
              </p>
              <Link
                href="/produits"
                className="inline-block bg-gray-900 text-white rounded-lg px-6 py-3 font-medium text-sm"
              >
                Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 flex flex-col gap-4">
                {items.map((item) => {
                  const atMax =
                    item.available_stock !== null && item.quantity >= item.available_stock;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm flex items-center gap-4"
                    >
                      <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Photo src={item.product.image} alt={item.product.name} />
                      </div>

                      <div className="flex-1">
                        <Link
                          href={`/produits/${item.product.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-gray-600 text-sm">{item.variant.label}</p>
                        )}
                        <p className="text-gray-500 text-sm mb-2">
                          {formatPrice(item.unit_price)}
                          {item.on_order && " · Sur commande"}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            disabled={busyId === item.id || item.quantity <= 1}
                            className="w-7 h-7 rounded-lg hover:text-orange-400 text-black border border-black flex items-center justify-center disabled:opacity-40"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-black text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            disabled={busyId === item.id || atMax}
                            className="w-7 h-7 rounded-lg hover:text-orange-400 text-black border border-black flex items-center justify-center disabled:opacity-40"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900 mb-2">
                          {formatPrice(item.line_total)}
                        </p>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={busyId === item.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 h-fit">
                <h2 className="font-medium text-gray-900 mb-4">Récapitulatif</h2>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <p>Sous-total</p>
                  <p>{formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <p>Livraison</p>
                  <p>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</p>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    Plus que {formatPrice(freeFrom - subtotal)} pour la livraison offerte.
                  </p>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-4 mb-6 mt-4">
                  <p>Total</p>
                  <p>{formatPrice(subtotal + shipping)}</p>
                </div>
                <Link
                  href="/checkout"
                  className="block text-center bg-black hover:bg-blue-400 text-white rounded-lg px-6 py-3 font-medium"
                >
                  Passer la commande
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}