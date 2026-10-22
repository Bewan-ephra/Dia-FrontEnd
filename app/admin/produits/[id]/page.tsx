"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProduct, updateProduct } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";
import { uploadProductImage, deleteProductImage, ProductImage } from "@/lib/api/product-images";
import { createProductVariant, deleteProductVariant, ProductVariant } from "@/lib/api/product-variants";

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

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [newVariantAttribute, setNewVariantAttribute] = useState("");
  const [newVariantValue, setNewVariantValue] = useState("");
  const [newVariantStock, setNewVariantStock] = useState("");
  const [isAddingVariant, setIsAddingVariant] = useState(false);

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
        setImages(product.images ?? []);
        setVariants(product.variants ?? []);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  if (!productId || !e.target.files || e.target.files.length === 0) return;

  const files = Array.from(e.target.files);

  setIsUploadingImage(true);
  setError(null);

  const uploadedImages: ProductImage[] = [];
  const failedFiles: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const newImage = await uploadProductImage(productId, files[i], images.length + i);
      uploadedImages.push(newImage);
    } catch {
      failedFiles.push(files[i].name);
    }
  }

  if (uploadedImages.length > 0) {
    setImages((prev) => [...prev, ...uploadedImages]);
  }

  if (failedFiles.length > 0) {
    setError(`Échec de l'upload pour : ${failedFiles.join(", ")}`);
  }

  setIsUploadingImage(false);
  e.target.value = "";
}

  async function handleImageDelete(imageId: number) {
    const confirmed = window.confirm("Supprimer cette image ?");
    if (!confirmed) return;

    try {
      await deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'image");
    }
  }

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;

    setIsAddingVariant(true);
    setError(null);
    try {
      const newVariant = await createProductVariant(productId, {
        attribute: newVariantAttribute,
        value: newVariantValue,
        stock: Number(newVariantStock),
      });
      setVariants((prev) => [...prev, newVariant]);
      setNewVariantAttribute("");
      setNewVariantValue("");
      setNewVariantStock("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la variante");
    } finally {
      setIsAddingVariant(false);
    }
  }

  async function handleVariantDelete(variantId: number) {
    const confirmed = window.confirm("Supprimer cette variante ?");
    if (!confirmed) return;

    try {
      await deleteProductVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de la variante");
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

      {/* Section Images */}
      <div className="mt-10 max-w-md">
        <h2 className="text-xl font-bold mb-4">Images du produit</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="relative">
              <img src={img.url} alt="" className="w-24 h-24 object-cover rounded border" />
              <button
                onClick={() => handleImageDelete(img.id)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <input
  type="file"
  accept="image/jpeg,image/png,image/jpg,image/webp"
  multiple
  onChange={handleImageUpload}
  disabled={isUploadingImage}
/>
        {isUploadingImage && <p className="text-gray-500 text-sm mt-2">Envoi en cours...</p>}
      </div>

      {/* Section Variantes */}
      <div className="mt-10 max-w-md">
        <h2 className="text-xl font-bold mb-4">Variantes (couleurs, tailles...)</h2>

        <div className="mb-4">
          {variants.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune variante pour ce produit.</p>
          ) : (
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100 text-left text-sm">
                  <th className="p-2">Attribut</th>
                  <th className="p-2">Valeur</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b text-sm">
                    <td className="p-2">{v.attribute}</td>
                    <td className="p-2">{v.value}</td>
                    <td className="p-2">{v.stock}</td>
                    <td className="p-2">
                      <button onClick={() => handleVariantDelete(v.id)} className="text-red-600">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleAddVariant} className="flex gap-2 items-end flex-wrap">
          <input
            type="text" placeholder="Attribut (ex: couleur)" value={newVariantAttribute}
            onChange={(e) => setNewVariantAttribute(e.target.value)} required
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text" placeholder="Valeur (ex: Rouge)" value={newVariantValue}
            onChange={(e) => setNewVariantValue(e.target.value)} required
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="number" placeholder="Stock" value={newVariantStock}
            onChange={(e) => setNewVariantStock(e.target.value)} required
            className="border rounded px-3 py-2 text-sm w-24"
          />
          <button
            type="submit" disabled={isAddingVariant}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {isAddingVariant ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}