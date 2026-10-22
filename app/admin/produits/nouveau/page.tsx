"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur chargement catégories"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const newProduct = await createProduct({
        name,
        slug,
        description: description || undefined,
        price: Number(price),
        compare_price: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock),
        sku: sku || undefined,
        category_id: Number(categoryId),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/produits/${newProduct.id}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ajouter un produit</h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">{error}</div>
      )}
      {success && (
        <p className="text-green-600 mb-4">
          Produit ajouté avec succès ! Redirection pour ajouter des images...
        </p>
      )}

      <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
        <input
          type="text" placeholder="Nom du produit" value={name}
          onChange={(e) => setName(e.target.value)} required
          className="border rounded px-4 py-2"
        />
        <input
          type="text" placeholder="Slug (ex: iphone-15)" value={slug}
          onChange={(e) => setSlug(e.target.value)} required
          className="border rounded px-4 py-2"
        />
        <textarea
          placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} rows={4}
          className="border rounded px-4 py-2"
        />
        <input
          type="number" step="0.01" placeholder="Prix" value={price}
          onChange={(e) => setPrice(e.target.value)} required
          className="border rounded px-4 py-2"
        />
        <input
          type="number" step="0.01" placeholder="Prix barré (promo, optionnel)" value={comparePrice}
          onChange={(e) => setComparePrice(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <input
          type="number" placeholder="Stock" value={stock}
          onChange={(e) => setStock(e.target.value)} required
          className="border rounded px-4 py-2"
        />
        <input
          type="text" placeholder="SKU (référence, optionnel)" value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <select
          value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
          className="border rounded px-4 py-2"
        >
          <option value="">Choisir une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          type="submit" disabled={isSaving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isSaving ? "Ajout..." : "Ajouter le produit"}
        </button>
      </form>
    </div>
  );
}