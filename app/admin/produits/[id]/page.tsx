"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProduct, updateProduct } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [productId, setProductId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

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
        const [product, categoriesList] = await Promise.all([
          getProduct(Number(id)),
          getCategories(),
        ]);

        setProductId(product.id);
        setName(product.name);
        setSlug(product.slug);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setComparePrice(product.compare_price ? String(product.compare_price) : "");
        setStock(String(product.stock));
        setSku(product.sku ?? "");
        setCategoryId(String(product.category.id));
        setCategories(categoriesList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du produit");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;

    setIsSaving(true);
    setError(null);
    try {
      await updateProduct(productId, {
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
      setTimeout(() => router.push("/admin/produits"), 1000);
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
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">{error}</div>
      )}
      {success && <p className="text-green-600 mb-4">Produit modifié avec succès !</p>}

      <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
        <input
          type="text" placeholder="Nom du produit" value={name}
          onChange={(e) => setName(e.target.value)} required
          className="border rounded px-4 py-2"
        />
        <input
          type="text" placeholder="Slug" value={slug}
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
          type="text" placeholder="SKU (optionnel)" value={sku}
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
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}