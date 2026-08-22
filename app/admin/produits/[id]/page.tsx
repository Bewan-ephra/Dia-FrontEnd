"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { products } from "@/lib/products";
import { categories } from "@/lib/categories";
export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<typeof products[0] | undefined>(undefined);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const found = products.find((p) => p.id === Number(id));
      setProduct(found);
      if (found) {
        setName(found.name);
        setPrice(String(found.price));
        setStock(String(found.stock));
        setCategory(found.category);
      }
    });
  }, [params]);

  if (!product) {
    return <div>Chargement...</div>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    product!.name = name;
    product!.price = Number(price);
    product!.stock = Number(stock);
    product!.category = category;
    setSuccess(true);
    setTimeout(() => {
        router.push("/admin/produits");
    }, 1000);
  }

  return (
    <div>
      <p className="text-gray-500 mb-4">Référence : {product.reference}</p>
      <h1 className="text-2xl font-bold mb-6">Modifier : {product.name}</h1>
      {success && (
        <p className="text-green-600 mb-4">Produit modifier avec succès !</p>
      )}
      <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-4 py-2"
        >
        <option value="">Choisir une catégorie</option>
          {categories.map((cat) => (
        <option key={cat.id} value={cat.name}>
          {cat.name}
        </option>
      ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}