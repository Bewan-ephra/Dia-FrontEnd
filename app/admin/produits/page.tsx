"use client";
import { useState} from "react";
import { products} from "@/lib/products";
import Link from "next/link";
export default function ProductsPage() {
   const [productList, setProductList] = useState(products);
const [search, setSearch] = useState("");
const filteredProducts = productList.filter((product) =>
  product.name.toLowerCase().includes(search.toLowerCase())
);

function handleDelete(id: number) {
  setProductList(productList.filter((p) => p.id !== id));
}
    return (
       <div>
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold">Produits</h1>
    <Link
      href="/admin/produits/nouveau"
      className="bg-blue-600 text-white rounded px-4 py-2"
    >
      + Ajouter un produit
    </Link>
  </div>
  <input
    type="text"
    placeholder="Rechercher un produit..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded px-4 py-2 mb-4 w-full max-w-sm"
  />
  <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                    <th className="p-3">ID</th>
                    <th className="p-3">Référence</th>
                    <th className="p-3">Nom</th>
                    <th className="p-3">Prix</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((product) => (
                       <tr key={product.id} className="border-b">
                        <td className="p-3">{product.id}</td>
                        <td className="p-3">{product.reference}</td>
                        <td className="p-3">{product.name}</td>
                        <td className="p-3">{product.price}</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3">{product.category}</td>
                        <td className="p-3">
                            <Link href={`/admin/produits/${product.id}`}className="text-blue-600 mr-3">
                            Modifier
                            </Link>
                            
                            <button 
                            onClick={() => handleDelete(product.id)}
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
    );
}