"use client";
import { useState} from "react";
import { products} from "@/lib/products";
import Link from "next/link";
import { Pencil, Trash2, Search, Package } from "lucide-react";
export default function ProductsPage() {
   const [productList, setProductList] = useState(products);
const [search, setSearch] = useState("");
const filteredProducts = productList.filter((product) =>
  product.name.toLowerCase().includes(search.toLowerCase())
);

function handleDelete(id: number) {
  setProductList(productList.filter((p) => p.id !== id));
}

function getStockBadge(stock: number) {
  if (stock === 0) return "bg-red-100 text-red-700";
  if (stock < 10) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}
    return (
     <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-lg font-semibold text-gray-900">Produits</h1>
    <Link
      href="/admin/produits/nouveau"
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
    >
      <Package size={16} />
      Ajouter un produit
    </Link>
  </div>

  <div className="relative mb-4 max-w-sm">
  <Search
    size={16}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
  />
  <input
    type="text"
    placeholder="Rechercher un produit..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
  />
</div>

  <table className="w-full border-collapse text-sm">
  <thead>
    <tr className="border-b bg-gray-200 text-left text-gray-500">
      <th className="p-3 font-medium">Référence</th>
      <th className="p-3 font-medium">Nom</th>
      <th className="p-3 font-medium">Prix</th>
      <th className="p-3 font-medium">Stock</th>
      <th className="p-3 font-medium">Catégorie</th>
      <th className="p-3 font-medium text-right">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredProducts.map((product) => (
      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="p-3 text-gray-500 font-mono text-xs">
          {product.reference}
        </td>
        <td className="p-3 font-medium text-gray-900">{product.name}</td>
        <td className="p-3">{product.price} FCFA</td>
        <td className="p-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStockBadge(
              product.stock
            )}`}
          >
            {product.stock === 0 ? "Rupture" : `${product.stock} en stock`}
          </span>
        </td>
        <td className="p-3 text-gray-500">{product.category}</td>
        <td className="p-3 text-right">
          <Link
            href={`/admin/produits/${product.id}`}
            className="inline-flex text-gray-500 hover:text-blue-600 p-1.5"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={() => handleDelete(product.id)}
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
    );
}