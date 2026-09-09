"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getProduct } from "@/lib/api";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    params.then(({ id }) => {
      getProduct(id).then((data) => setProduct(data));
    });
  }, [params]);

  if (!product) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-gray-100 rounded-xl h-80 mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <p className="text-xl text-blue-600 font-semibold mb-4">
          {product.price} FCFA
        </p>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <button className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium">
          Ajouter au panier
        </button>
      </div>
    </>
  );
}