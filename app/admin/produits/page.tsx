"use client";
import { useState, useEffect } from "react";
import { getProducts, deleteProduct, Product } from "@/lib/api/products";
import Link from "next/link";

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchProducts(searchTerm: string) {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts(searchTerm || undefined);
      setProductList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Debounce : on attend 400ms après la dernière frappe avant d'appeler l'API
    const timer = setTimeout(() => {
      fetchProducts(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Supprimer ce produit ? Cette action est irréversible.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProductList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
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

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Chargement des produits...</p>
      ) : productList.length === 0 ? (
        <p className="text-gray-500">Aucun produit trouvé.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-3">{product.id}</td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.price}</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">{product.category.name}</td>
                <td className="p-3">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="text-blue-600 mr-3"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="text-red-600 disabled:opacity-50"
                  >
                    {deletingId === product.id ? "Suppression..." : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}