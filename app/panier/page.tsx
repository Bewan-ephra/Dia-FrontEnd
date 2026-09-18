"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { getCart, removeFromCart, getCategoryImage } from "@/lib/api";
import Link from "next/link";

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
         <div className="bg-white min-h-screen">
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
                                <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {getCategoryImage(item.product.category?.name) ? (
        <Image
            src={getCategoryImage(item.product.category?.name)!}
            alt={item.product.name}
            fill
            className="object-cover"
        />
            ) : null}
            </div>
        <div>
             <p className="font-medium text-gray-900">
             {item.product.name}
                </p>
            <p className="text-gray-500">
            {item.quantity} x {item.product.price} FCFA
                </p>
            </div>
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
                            
            <Link
                href="/checkout"
                className="block text-center bg-blue-600 text-white rounded-lg px-6 py-3 font-medium mt-4"
            >
                Passer la commande
            </Link>
                        
        </div>
    )}
        </div>
        </div>
        </>
    );
}