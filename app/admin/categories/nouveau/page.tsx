"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCategory, getCategories, Category } from "@/lib/api/categories";
import { slugify } from "@/lib/slugify";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [parents, setParents] = useState<Category[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setParents)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur chargement catégories")
      );
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    // Le slug suit le nom tant que l'utilisateur ne l'a pas modifié lui-même
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await createCategory({
        name,
        slug,
        description: description || null,
        parent_id: parentId ? Number(parentId) : null,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/categories"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ajouter une catégorie</h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}
      {success && (
        <p className="text-green-600 mb-4">Catégorie ajoutée avec succès !</p>
      )}

      <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom de la catégorie"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="border rounded px-4 py-2"
        />
        <input
          type="text"
          placeholder="Slug (ex: vetements)"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
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
          className="border rounded px-4 py-2"
        >
          <option value="">Aucune (catégorie principale)</option>
          {parents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isSaving ? "Ajout..." : "Ajouter la catégorie"}
        </button>
      </form>
    </div>
  );
}