"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getProducts } from "@/lib/api";

export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then((data) => setProducts(data));
  }, []);

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
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
            >
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