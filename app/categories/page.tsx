"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getCategoriesPublic, getCategoryImage } from "@/lib/api";

export default function CategoriesPublicPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategoriesPublic()
      .then(setCategories)
      .catch((err: Error) => setError(err.message || "Impossible de charger les catégories."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Catégories</h1>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">Aucune catégorie pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/produits?category_id=${category.id}`}
                    className="relative block rounded-xl overflow-hidden h-40 group bg-gray-100"
                  >
                    {getCategoryImage(category.name) ? (
                      <>
                        <Image
                          src={getCategoryImage(category.name)!}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <p className="font-medium text-white">{category.name}</p>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="font-medium text-gray-700">{category.name}</p>
                      </div>
                    )}
                  </Link>

                  {(category.children ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {category.children.map((child: any) => (
                        <Link
                          key={child.id}
                          href={`/produits?category_id=${child.id}`}
                          className="text-xs text-gray-600 border border-gray-300 rounded-full px-3 py-1 hover:border-gray-900"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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