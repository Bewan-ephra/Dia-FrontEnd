"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getFavorites, toggleFavorite } from "@/lib/api";

export default function FavorisPage() {
    const [favorites, setFavorites] = useState<any[]>([]);

    useEffect(() => {
        setFavorites(getFavorites());
    }, []);

    function handleRemove(e:React.MouseEvent, product: any) {
        e.preventDefault();
        const updated = toggleFavorite(product);
        setFavorites(updated);
    }

    return (
        <>
            <Navbar />
            <div className="bg-white min-h-screen">
                <div className="max-w-6xl mx-auto px-8 py-16">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">
                        Mes favoris
                    </h1>

                    {favorites.length === 0 ? (
                        <p className="text-gray-500">Aucun favori pour l'instant.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {favorites.map((product) => (
                                <Link
                                key={product.id}
                                href={`/produits/${product.id}`}
                                className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
                                >
                                    <button
                                        onClick={(e) => handleRemove(e, product)}
                                        className="absolute top-3 right-3 z-10"
                                        >
                                            <Heart size={20} className="fill-red-500 text-red-500" />
                                        </button>
                                        <div className="bg-gray-100 rounded-lg h-40 mb-3"></div>
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        <p className="text-gray-500">{product.price} FCFA</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            </>
    );
}

