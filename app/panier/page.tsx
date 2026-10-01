"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { getCart, removeFromCart, getCategoryImage } from "@/lib/api";
import Link from "next/link";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function PanierPage() {
  const [cart, setCart] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    getCart(token).then((data) => setCart(data));
  }, [router]);

  async function handleRemove(itemId: number) {
    const token = localStorage.getItem("token");
    await removeFromCart(token!, itemId);
    const updated = await getCart(token!);
    setCart(updated);
  }

  if (!cart) {
    return <div>Chargement...</div>;
  }

  const isEmpty = cart.cart.items.length === 0;

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <h1 className="text-2xl text-center font-bold text-gray-900 mb-8">
             PANIER {!isEmpty && `(${cart.cart.items.length})`}
          </h1>

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
                {cart.cart.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {getCategoryImage(item.product.category?.name) ? (
                        <Image
                          src={getCategoryImage(item.product.category?.name)!}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        {item.product.price} FCFA
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900 mb-2">
                        {item.quantity * item.product.price} FCFA
                      </p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 h-fit">
                <h2 className="font-medium text-gray-900 mb-4">
                  Récapitulatif
                </h2>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <p>Sous-total</p>
                  <p>{cart.total} FCFA</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Livraison</p>
                  <p>2 000 FCFA</p>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-4 mb-6">
                  <p>Total</p>
                  <p>{cart.total + 2000} FCFA</p>
                </div>
                <Link
                  href="/checkout"
                  className="block text-center bg-blue-600 text-white rounded-lg px-6 py-3 font-medium"
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