"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Photo from "@/components/Photo";
import { getProductsPage } from "@/lib/api";
import { useFavoriteIds } from "@/lib/useFavorites";
import { productThumb } from "@/lib/product-media";
import { formatPrice } from "@/lib/format";

function ProduitsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id") ?? "";
  const search = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ids: favoriteIds, toggle: handleToggleFavorite } = useFavoriteIds();

  // Nouveau filtre : on repart de la première page
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getProductsPage({ categoryId, search, page: 1 })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.items);
        setPage(1);
        setLastPage(res.lastPage);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Impossible de charger les produits.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, search]);

  async function loadMore() {
    const next = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await getProductsPage({ categoryId, search, page: next });
      setProducts((prev) => [...prev, ...res.items]);
      setPage(next);
      setLastPage(res.lastPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la suite.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {search ? `Résultats pour « ${search} »` : "Notre catalogue"}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Chargement des produits...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Aucun produit trouvé.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const price = Number(product.price);
              const compare = product.compare_price ? Number(product.compare_price) : null;
              const soldOut = !product.on_order && product.available_stock <= 0;

              return (
                <Link
                  key={product.id}
                  href={`/produits/${product.id}`}
                  className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
                >
                  <button
                    onClick={(e) => handleToggleFavorite(e, product)}
                    className="absolute top-3 right-3 z-10"
                  >
                    <Heart
                      size={20}
                      className={
                        favoriteIds.includes(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <Photo src={productThumb(product)} alt={product.name} />
                    {soldOut && (
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs text-center py-1">
                        Rupture de stock
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-gray-900">{product.name}</p>

                  {product.on_order && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                      Sur commande
                    </span>
                  )}

                  <p className="text-gray-500">
                    {formatPrice(price)}
                    {compare && compare > price && (
                      <span className="ml-2 text-xs text-gray-400 line-through">
                        {formatPrice(compare)}
                      </span>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>

          {page < lastPage && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="border border-black text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                {isLoadingMore ? "Chargement..." : "Voir plus de produits"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProduitsPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        {/* useSearchParams exige un Suspense pour la compilation de production */}
        <Suspense fallback={<p className="p-16 text-gray-500">Chargement...</p>}>
          <ProduitsContent />
        </Suspense>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}