"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getProduct, addToCart } from "@/lib/api";

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

  async function handleAddToCart() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Connecte-toi pour ajouter un produit au panier.");
      return;
    }
    await addToCart(token, product.id, 1);
    alert("Produit ajouté au panier !");
  }

  return (
    <>
      <Navbar />
     <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <p className="text-xl text-blue-600 font-semibold mb-4">
          {product.price} FCFA
        </p>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <button 
         onClick={handleAddToCart}
         className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium"
         >
          Ajouter au panier
        </button>
      </div>
      </div>
    </>
  );
}