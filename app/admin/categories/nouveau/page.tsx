"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/categories";

export default function NewCategoryPage() {
    const [name, setName] = useState("");
    const router = useRouter();
    const [success, setSuccess] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const newCategory = {
            id: categories.length + 1,
            name,
            productCount: 0,
        };
        categories.push(newCategory);
        setSuccess(true);
        setTimeout(() => {
            router.push("/admin/categories");
        }, 1000);
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Ajouter une catégories</h1>
            {success && (
                <p className="text-green-600 mb-4">Catégories ajoutée avec succès !</p>
            )}
            <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
                <input
                type="text"
                placeholder="Nom de la catégorie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded px-4 py-2"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white rounded px-4 py-2"
                    >
                        Ajouter la catégorie
                </button>

            </form>
        </div>
    );
}