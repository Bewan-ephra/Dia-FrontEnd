"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getProducts, getFavorites, toggleFavorite } from "@/lib/api";
import { Heart } from "lucide-react";


export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then((data) => setProducts(data));
  }, []);

  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
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
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Notre catalogue
        </h1>

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
              <div className="bg-gray-100 rounded-lg h-40 mb-3"></div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-gray-500">{product.price} FCFA</p>

            </Link>
          ))}
        </div>
      </div>
    </>
  );
}