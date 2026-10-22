"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getProduct, Product } from "@/lib/api/products";

export default function ViewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getProduct(Number(id));
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du produit");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  if (isLoading) return <p className="text-gray-500">Chargement...</p>;

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3">
        {error}
      </div>
    );
  }

  if (!product) return null;

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="flex gap-3">
          <Link
            href={`/admin/produits/${product.id}`}
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            Modifier
          </Link>
          <Link href="/admin/produits" className="border rounded px-4 py-2">
            Retour à la liste
          </Link>
        </div>
      </div>

      {/* Statut actif/inactif */}
      <span
        className={`inline-block px-3 py-1 rounded text-sm font-medium mb-6 ${
          product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {product.is_active ? "Actif" : "Inactif"}
      </span>

      {/* Informations générales */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Slug" value={product.slug} />
          <InfoRow label="SKU" value={product.sku ?? "—"} />
          <InfoRow label="Catégorie" value={product.category.name} />
          <InfoRow label="Prix" value={`${Number(product.price).toFixed(2)} €`} />
          <InfoRow
            label="Prix barré"
            value={product.compare_price ? `${Number(product.compare_price).toFixed(2)} €` : "—"}
          />
          <InfoRow label="Stock" value={String(product.stock)} />
          {product.vendor && <InfoRow label="Vendeur" value={product.vendor.name} />}
          {averageRating && <InfoRow label="Note moyenne" value={`${averageRating} / 5`} />}
        </div>

        {product.description && (
          <div className="mt-4">
            <p className="text-gray-500 text-sm mb-1">Description</p>
            <p className="text-sm">{product.description}</p>
          </div>
        )}
      </div>

      {/* Images */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        {!product.images || product.images.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune image.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      {/* Variantes */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Variantes</h2>
        {!product.variants || product.variants.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune variante.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-2">Attribut</th>
                <th className="p-2">Valeur</th>
                <th className="p-2">Ajustement prix</th>
                <th className="p-2">Stock</th>
                <th className="p-2">SKU</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id} className="border-b text-sm">
                  <td className="p-2">{v.attribute}</td>
                  <td className="p-2">{v.value}</td>
                  <td className="p-2">{Number(v.price_adjustment).toFixed(2)} €</td>
                  <td className="p-2">{v.stock}</td>
                  <td className="p-2">{v.sku ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Avis clients */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Avis clients</h2>
        {!product.reviews || product.reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun avis pour ce produit.</p>
        ) : (
          <ul className="space-y-3">
            {product.reviews.map((r) => (
              <li key={r.id} className="border-b pb-3 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{r.user.name}</span>
                  <span className="text-yellow-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-gray-600">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}