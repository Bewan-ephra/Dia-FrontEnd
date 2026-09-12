"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCategoriesPublic } from "@/lib/api";

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
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition text-center"
            >
              <p className="font-medium text-gray-900">{category.name}</p>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}