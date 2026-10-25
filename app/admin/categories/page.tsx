"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search, FolderPlus } from "lucide-react";
import { getCategories, deleteCategory, Category } from "@/lib/api/categories";

type CategoryRow = Category & { depth: number };

export default function CategoriesPage() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        setCategoryList(await getCategories());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des catégories"
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Catégories principales suivies de leurs sous-catégories
  const rows: CategoryRow[] = categoryList.flatMap((c) => [
    { ...c, depth: 0 },
    ...(c.children ?? []).map((child) => ({ ...child, depth: 1 })),
  ]);

  const filteredRows = rows.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer cette catégorie ?")) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteCategory(id);
      setCategoryList((prev) =>
        prev
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            children: (c.children ?? []).filter((child) => child.id !== id),
          }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
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

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement des catégories...</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune catégorie trouvée.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Nombre de produits</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((category) => (
              <tr
                key={category.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td
                  className={`p-3 text-gray-900 ${
                    category.depth === 1 ? "pl-8" : "font-medium"
                  }`}
                >
                  {category.depth === 1 && (
                    <span className="text-gray-400 mr-2">↳</span>
                  )}
                  {category.name}
                </td>
                <td className="p-3 text-gray-500">{category.products_count ?? 0}</td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="inline-flex text-gray-500 hover:text-blue-600 p-1.5"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
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
    </div>
  );
}