"use client";

import { products } from "@/lib/products";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/categories";

export default function NewProductPage() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const router = useRouter();
    const [success, setSuccess] = useState(false);
    
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
       const newProduct = {
        id: products.length + 1,
        name,
        price: Number(price),
        stock: Number(stock),
        category,
       };
       products.push(newProduct);
       setSuccess(true);
       setTimeout(() => {
        router.push("/admin/produits");
       }, 1000);
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Ajouter un produit</h1>
            {success && (
                <p className="text-green-600 mb-4">Produit ajouter avec succès !</p>
            )}

            <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
                <input
                type="text"
                placeholder="Nom du produit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded px-4 py-2"
                />

                <input
                type="number"
                placeholder="Prix"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border rounded px-4"
                />

                <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="border rounded px-4 py-2"
                />

                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded px-4 py-2"
                >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                    </select>
                    
                <button
                type="submit"
                className="bg-blue-600 text-white rounded px-4 py-2"
                >
                    Ajouter le produit
                </button>
            </form>
        </div>
    );
}