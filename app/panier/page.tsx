"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCart, removeFromCart } from "@/lib/api";

export default function PanierPage() {
    const [cart, setCart] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token) {
            router.push("/connexion");
            return;
        }
        getCart(token).then((data) => setCart(data));
    }, [router]);

    async function handleRemove(itemId: number) {
        const token = localStorage.getItem("token");
        await removeFromCart(token!, itemId);
        const updated = await getCart(token!);
        setCart(updated);
    }

    if (!cart) {
        return <div>Chargement...</div>;
    }

    return(
        <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-8 py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon panier</h1>

                {cart.cart.items.length === 0 ? (
                    <p className="text-gray-500">Ton panier est vide.</p>
                ) :(
                    <div className="flex flex-col gap-4">
                        {cart.cart.items.map((item: any) => (
                            <div
                            key={item.id}
                            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {item.product.name}
                                    </p>
                                    <p className="text-gray-500">
                                        {item.quantity} x {item.product.price} FCFA
                                    </p>
                                </div>
                                <button
                                onClick={() => handleRemove(item.id)}
                                className="text-red-600"
                                >
                                    Retirer
                                </button>
                                </div>
                        ))}

                        <div className="text-right font-bold text-lg text-gray-900 mt-4">
                            Total : {cart.total} FCFA
                        </div>
                    </div>
                )}
        </div>
        </>
    );
}