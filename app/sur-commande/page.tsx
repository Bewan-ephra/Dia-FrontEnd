"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { getProducts, getFavorites, toggleFavorite, getCategoryImage  } from "@/lib/api";

export default function SurCommandePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then((data) =>
      setProducts(data.filter((p: any) => p.onOrder))
    );
    setFavorites(getFavorites());
  }, []);

  function handleToggleFavorite(e: React.MouseEvent, product: any) {
    e.preventDefault();
    const updated = toggleFavorite(product);
    setFavorites(updated);
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sur commande
          </h1>
          <p className="text-gray-600 mb-8">
            Des créations personnalisées, confectionnées spécialement pour vous.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
                      favorites.some((f) => f.id === product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }
                  />
                </button>
                <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                  {getCategoryImage(product.category?.name) ? (
                
                <Image
                  src={getCategoryImage(product.category?.name)!}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                  ) : null}
                  </div>
                  {product.onOrder && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                  Sur commande
                    </span>
                  )}
                  
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-gray-500">{product.price} FCFA</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}