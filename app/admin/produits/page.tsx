"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search, Package } from "lucide-react";
import { getAdminProducts, deleteProduct, Product } from "@/lib/api/products";

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Debounce : on attend 400 ms après la dernière frappe avant d'appeler l'API
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAdminProducts({
          search: search || undefined,
          status: status || undefined,
          page,
        });
        if (cancelled) return;
        setProductList(res.data);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des produits"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, status, page, reloadKey]);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Supprimer définitivement ce produit ?\n\nPour le retirer de la boutique sans le perdre, ouvre-le et décoche « Visible dans la boutique »."
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteProduct(id);
      if (productList.length === 1 && page > 1) setPage((p) => p - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
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

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm w-full sm:w-auto sm:flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher (nom ou référence)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Tous les produits</option>
          <option value="active">Visibles</option>
          <option value="hidden">Masqués</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement des produits...</p>
      ) : productList.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun produit trouvé.</p>
      ) : (
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
            {productList.map((product) => (
              <tr
                key={product.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  product.is_active ? "" : "opacity-60"
                }`}
              >
                <td className="p-3 text-gray-500 font-mono text-xs">
                  {product.sku ?? `#${product.id}`}
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {product.name}
                  {!product.is_active && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                      Masqué
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {Number(product.price).toLocaleString("fr-FR")} FCFA
                </td>
                <td className="p-3">
                  {product.on_order ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Sur commande
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStockBadge(
                        product.available_stock
                      )}`}
                    >
                      {product.available_stock === 0
                        ? "Rupture"
                        : `${product.available_stock} en stock`}
                    </span>
                  )}
                </td>
                <td className="p-3 text-gray-500">{product.category.name}</td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="inline-flex text-gray-500 hover:text-blue-600 p-1.5"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="inline-flex text-gray-500 hover:text-red-600 p-1.5 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            Page {page} sur {lastPage} · {total} produits
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || isLoading}
              className="border rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= lastPage || isLoading}
              className="border rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}