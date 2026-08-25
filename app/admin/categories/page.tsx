"use client";
import { useState} from "react";
import {categories} from "@/lib/categories";
import Link from "next/link";
import { products } from "@/lib/products";
import { Pencil, Trash2, Search, FolderPlus } from "lucide-react";


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
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-lg font-semibold text-gray-900">Catégories</h1>
    <Link
      href="/admin/categories/nouveau"
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
    >
      <FolderPlus size={16} />
      Ajouter une catégorie
    </Link>
  </div>

            <div className="relative mb-4 max-w-sm">
                <Search
                    size={16}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
                    />
            </div>

            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-gray-200 text-left text-gray-500">
                        <th className="p-3 font-medium">Nom</th>
                        <th className="p-3 font-medium">Nombre de produits</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.map((category) => (
                        <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{category.name}</td>
                            <td className="p-3 text-gray-500">{getProductCount(category.name)}</td>
                            <td className="p-3 text-right">
                                <Link 
                                href={`/admin/categories/${category.id}`}
                                className="inline-flex text-gray-500 hover:text-blue-600 p-1.5"
                                >
                                  <Pencil size={16} />  
                                </Link>
                                <button 
                                    onClick={() => handleDelete(category.id)}
                                    className="inline-flex text-gray-500 hover:text-red-600 p-1.5"
                                    >
                                        <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> 
        </div>
        
    )
}