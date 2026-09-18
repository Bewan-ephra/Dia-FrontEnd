"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { getCategoriesPublic, getCategoryImage } from "@/lib/api";

export default function CategoriesPublicPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getCategoriesPublic().then((data) => setCategories(data));
  }, []);

  return (
    <>
      <Navbar />
     <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Catégories</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
           <Link
              key={category.id}
              href={`/produits?category_id=${category.id}`}
              className="relative rounded-xl overflow-hidden h-40 group bg-gray-100"
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
          ))}
        </div>
      </div>
      </div>
    </>
  );
}