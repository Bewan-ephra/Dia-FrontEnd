"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Photo from "@/components/Photo";
import { getFavorites, toggleFavorite } from "@/lib/api";
import { productThumb } from "@/lib/product-media";
import { formatPrice } from "@/lib/format";

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch((err: Error) => setError(err.message || "Impossible de charger tes favoris."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleRemove(e: React.MouseEvent, product: any) {
    e.preventDefault();
    const previous = favorites;
    setFavorites((prev) => prev.filter((p) => p.id !== product.id));

    try {
      await toggleFavorite(product, true);
    } catch (err) {
      setFavorites(previous);
      setError(err instanceof Error ? err.message : "Impossible de retirer ce favori.");
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Mes favoris</h1>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : favorites.length === 0 ? (
            <p className="text-gray-500">Aucun favori pour l&apos;instant.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <Link
                  key={product.id}
                  href={`/produits/${product.id}`}
                  className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
                >
                  <button
                    onClick={(e) => handleRemove(e, product)}
                    className="absolute top-3 right-3 z-10"
                  >
                    <Heart size={20} className="fill-red-500 text-red-500" />
                  </button>
                  <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <Photo src={productThumb(product)} alt={product.name} />
                  </div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-500">{formatPrice(Number(product.price))}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}