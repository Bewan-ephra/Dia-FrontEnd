"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/api/categories";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await createCategory({
        name,
        slug,
        description: description || undefined,
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
      {success && <p className="text-green-600 mb-4">Catégorie ajoutée avec succès !</p>}

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
          placeholder="Slug (ex: electronique)"
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