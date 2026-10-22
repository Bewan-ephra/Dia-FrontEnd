"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCategory, updateCategory } from "@/lib/api/categories";

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
        const category = await getCategory(Number(id));
        setCategoryId(category.id);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement de la catégorie");
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
        description: description || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/categories"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {name}</h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}
      {success && <p className="text-green-600 mb-4">Catégorie modifiée avec succès !</p>}

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