"use client";
import { useState} from "react";
import {categories} from "@/lib/categories";
import Link from "next/link";
import { products } from "@/lib/products";

export default function CategoriesPage() {
    const [search, setSearch] = useState("");
    const [categoryList, setCategoryList] = useState(categories);
    const filteredCategories = categoryList.filter((category) =>
  category.name.toLowerCase().includes(search.toLowerCase())
);

function getProductCount(categoryName: string) {
  return products.filter((p) => p.category === categoryName).length;
}

function handleDelete(id: number) {
    setCategoryList(categoryList.filter((c) => c.id !== id));
}

    return (
        <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Catégories</h1> 
            <Link
            href="/admin/categories/nouveau"
            className="bg-blue-600 text-white rounded px-4 py-2"
            >
                + Ajouter une catégorie
            </Link>
            </div>
                <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-4 py-2 mb-4 w-full max-w-sm"
                    />
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="p-3">ID</th>
                        <th className="p-3">Nom</th>
                        <th className="p-3">Nombre de produits</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.map((category) => (
                        <tr key={category.id} className="border-b">
                            <td className="p-3">{category.id}</td>
                            <td className="p-3">{category.name}</td>
                            <td className="p-3">{getProductCount(category.name)}</td>
                            <td className="p-3">
                                <Link href={`/admin/categories/${category.id}`}className="text-blue-600 mr-3">Modifier</Link>
                                <button 
                                    onClick={() => handleDelete(category.id)}
                                    className="text-red-600"
                                    >
                                        Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> 
        </div>
    )
}