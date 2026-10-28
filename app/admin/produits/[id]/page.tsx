"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProduct, updateProduct, ProductDetails } from "@/lib/api/products";
import ProductDetailsEditor, { cleanDetails } from "@/components/admin/ProductDetailsEditor";
import { getCategories, Category } from "@/lib/api/categories";
import { uploadProductImage, deleteProductImage, ProductImage } from "@/lib/api/product-images";
import {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  ProductVariant,
} from "@/lib/api/product-variants";

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
  const [onOrder, setOnOrder] = useState(false);
  const [leadTime, setLeadTime] = useState("");
  const [isActive, setIsActive] = useState(true);
const [details, setDetails] = useState<ProductDetails>({});

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newImageColor, setNewImageColor] = useState("");

  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newAdjustment, setNewAdjustment] = useState("");
  const [newStock, setNewStock] = useState("");
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasVariants = variants.length > 0;
  const variantStockTotal = variants.reduce((sum, v) => sum + v.stock, 0);
  const stockLocked = hasVariants || onOrder;
  const colors = Array.from(
    new Set(variants.map((v) => v.color).filter((c): c is string => !!c))
  );

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
        setOnOrder(product.on_order);
        setLeadTime(product.lead_time_days ? String(product.lead_time_days) : "");
        setIsActive(product.is_active);
setDetails(product.details ?? {});
        setCategories(categoriesList.flatMap((c) => [c, ...(c.children ?? [])]));
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
        stock: stockLocked ? undefined : Number(stock),
        sku: sku || undefined,
        category_id: Number(categoryId),
        on_order: onOrder,
        lead_time_days: onOrder && leadTime ? Number(leadTime) : null,
        is_active: isActive,
details: cleanDetails(details),
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

    const uploaded: ProductImage[] = [];
    const failed: string[] = [];

    // Une requête par fichier : l'API n'accepte qu'une image à la fois
    for (let i = 0; i < files.length; i++) {
      try {
        const img = await uploadProductImage(
          productId,
          files[i],
          images.length + i,
          newImageColor || null
        );
        uploaded.push(img);
      } catch {
        failed.push(files[i].name);
      }
    }

    if (uploaded.length > 0) setImages((prev) => [...prev, ...uploaded]);
    if (failed.length > 0) setError(`Échec de l'envoi pour : ${failed.join(", ")}`);

    setIsUploadingImage(false);
    e.target.value = "";
  }

  async function handleImageDelete(imageId: number) {
    if (!window.confirm("Supprimer cette image ?")) return;
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
      const v = await createProductVariant(productId, {
        color: newColor.trim() || undefined,
        size: newSize.trim() || undefined,
        price_adjustment: newAdjustment.trim() === "" ? undefined : Number(newAdjustment),
        stock: Number(newStock),
      });
      setVariants((prev) => [...prev, v]);
      // On garde la couleur : on enchaîne souvent plusieurs tailles pour la même couleur
      setNewSize("");
      setNewAdjustment("");
      setNewStock("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la variante");
    } finally {
      setIsAddingVariant(false);
    }
  }

  async function handleVariantStockChange(variant: ProductVariant, value: string) {
    const newValue = Number(value);
    if (!Number.isInteger(newValue) || newValue < 0 || newValue === variant.stock) return;

    setError(null);
    try {
      const updated = await updateProductVariant(variant.id, { stock: newValue });
      setVariants((prev) =>
        prev.map((v) => (v.id === variant.id ? { ...v, stock: updated.stock } : v))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du stock");
    }
  }

  async function handleVariantDelete(variant: ProductVariant) {
    if (
      !window.confirm(
        "Supprimer cette variante ? Si c'est la dernière de cette couleur, les photos de la couleur seront aussi supprimées."
      )
    )
      return;

    try {
      await deleteProductVariant(variant.id);
      const remaining = variants.filter((v) => v.id !== variant.id);
      setVariants(remaining);

      if (variant.color && !remaining.some((v) => v.color === variant.color)) {
        setImages((prev) => prev.filter((img) => img.color !== variant.color));
        if (newImageColor === variant.color) setNewImageColor("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de la variante");
    }
  }

  if (isLoading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <p className="text-gray-500 mb-4">Référence : {sku || `#${productId}`}</p>
      <h1 className="text-2xl font-bold mb-6">Modifier : {name}</h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
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
          type="number" step="0.01" placeholder="Prix (FCFA)" value={price}
          onChange={(e) => setPrice(e.target.value)} required
          className="border rounded px-4 py-2"
        />
        <input
          type="number" step="0.01" placeholder="Prix barré (promo, optionnel)" value={comparePrice}
          onChange={(e) => setComparePrice(e.target.value)}
          className="border rounded px-4 py-2"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox" checked={onOrder}
            onChange={(e) => setOnOrder(e.target.checked)}
          />
          Produit sur commande (le stock n&apos;est pas suivi)
        </label>
        {onOrder && (
          <input
            type="number" min={1} placeholder="Délai de livraison (jours)" value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            className="border rounded px-4 py-2"
          />
        )}

        <input
          type="number" placeholder="Stock"
          value={hasVariants ? String(variantStockTotal) : stock}
          onChange={(e) => setStock(e.target.value)}
          required={!stockLocked}
          disabled={stockLocked}
          className="border rounded px-4 py-2 disabled:bg-gray-100 disabled:text-gray-500"
        />
        {hasVariants && (
          <p className="text-gray-500 text-xs -mt-2">
            Le stock est géré par variante (total : {variantStockTotal}). Modifie-le dans le
            tableau des variantes ci-dessous.
          </p>
        )}
        <input
          type="text" placeholder="Référence / SKU (optionnel)" value={sku}
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
        <label className="flex items-center gap-2 text-sm">
  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
  Visible dans la boutique (décoche pour masquer le produit sans le supprimer)
</label>

<ProductDetailsEditor value={details} onChange={setDetails} />
        <button
          type="submit" disabled={isSaving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      {/* Variantes */}
      <div className="mt-10 max-w-xl">
        <h2 className="text-xl font-bold mb-1">Variantes</h2>
        <p className="text-gray-500 text-xs mb-4">
          Une ligne = une combinaison achetable (ex. Noir + M), avec son propre stock.
          Renseigne la couleur, la taille, ou les deux. Toutes les variantes d&apos;un produit
          doivent suivre le même format.
        </p>

        {variants.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">Aucune variante pour ce produit.</p>
        ) : (
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-2">Couleur</th>
                <th className="p-2">Taille</th>
                <th className="p-2">Supplément</th>
                <th className="p-2">Stock</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b text-sm">
                  <td className="p-2">{v.color ?? "—"}</td>
                  <td className="p-2">{v.size ?? "—"}</td>
                  <td className="p-2">
                    {Number(v.price_adjustment) !== 0 ? `${Number(v.price_adjustment)} FCFA` : "—"}
                  </td>
                  <td className="p-2">
                    <input
                      key={`${v.id}-${v.stock}`}
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      onBlur={(e) => handleVariantStockChange(v, e.target.value)}
                      className="border rounded px-2 py-1 w-20 text-sm"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => handleVariantDelete(v)}
                      className="text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={handleAddVariant} className="flex gap-2 items-end flex-wrap">
          <input
            type="text" placeholder="Couleur (ex: Noir)" value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-36"
          />
          <input
            type="text" placeholder="Taille (ex: M, 42)" value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-32"
          />
          <input
            type="number" placeholder="Supplément" value={newAdjustment}
            onChange={(e) => setNewAdjustment(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-28"
          />
          <input
            type="number" min={0} placeholder="Stock" value={newStock}
            onChange={(e) => setNewStock(e.target.value)} required
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

      {/* Images */}
      <div className="mt-10 max-w-xl">
        <h2 className="text-xl font-bold mb-4">Images du produit</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          {images.map((img) => (
            <div key={img.id} className="w-24">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(img.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{img.color ?? "Général"}</p>
            </div>
          ))}
        </div>

        {colors.length > 0 && (
          <select
            value={newImageColor}
            onChange={(e) => setNewImageColor(e.target.value)}
            className="border rounded px-3 py-2 text-sm mb-3 block"
          >
            <option value="">Photo générale (toutes les couleurs)</option>
            {colors.map((c) => (
              <option key={c} value={c}>Couleur : {c}</option>
            ))}
          </select>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          multiple
          onChange={handleImageUpload}
          disabled={isUploadingImage}
        />
        {isUploadingImage && <p className="text-gray-500 text-sm mt-2">Envoi en cours...</p>}
      </div>
    </div>
  );
}