"use client";
import { useState, useEffect } from "react";
import { getCategories, deleteCategory, Category } from "@/lib/api/categories";
import Link from "next/link";

export default function CategoriesPage() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCategories();
        setCategoryList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des catégories");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const filteredCategories = categoryList.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Supprimer cette catégorie ? Cette action est irréversible.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategoryList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
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

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Chargement des catégories...</p>
      ) : filteredCategories.length === 0 ? (
        <p className="text-gray-500">Aucune catégorie trouvée.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id} className="border-b">
                <td className="p-3">{category.id}</td>
                <td className="p-3">{category.name}</td>
                <td className="p-3 text-gray-500">{category.slug}</td>
                <td className="p-3">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-blue-600 mr-3"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="text-red-600 disabled:opacity-50"
                  >
                    {deletingId === category.id ? "Suppression..." : "Supprimer"}
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