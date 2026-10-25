"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCategory,
  getCategories,
  updateCategory,
  Category,
} from "@/lib/api/categories";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [parents, setParents] = useState<Category[]>([]);
  const [hasChildren, setHasChildren] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setIsLoading(true);
      setError(null);
      try {
        const [category, roots] = await Promise.all([
          getCategory(Number(id)),
          getCategories(),
        ]);

        setCategoryId(category.id);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description ?? "");
        setParentId(category.parent_id ? String(category.parent_id) : "");
        setHasChildren((category.children?.length ?? 0) > 0);
        // Une catégorie ne peut pas être son propre parent
        setParents(roots.filter((c) => c.id !== category.id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement de la catégorie"
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;

    setIsSaving(true);
    setError(null);
    try {
      await updateCategory(categoryId, {
        name,
        slug,
        description: description || null,
        parent_id: parentId ? Number(parentId) : null,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/categories"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {name}</h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}
      {success && (
        <p className="text-green-600 mb-4">Catégorie modifiée avec succès !</p>
      )}

      <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom de la catégorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border rounded px-4 py-2"
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="border rounded px-4 py-2"
        />
        <textarea
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border rounded px-4 py-2"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={hasChildren}
          className="border rounded px-4 py-2 disabled:bg-gray-100"
        >
          <option value="">Aucune (catégorie principale)</option>
          {parents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {hasChildren && (
          <p className="text-gray-500 text-sm -mt-2">
            Cette catégorie a des sous-catégories : elle ne peut pas devenir une sous-catégorie.
          </p>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}