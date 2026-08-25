"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/categories";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [category, setCategory] = useState<typeof categories[0] | undefined>(undefined);
  const [name, setName] = useState("");
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const found = categories.find((c) => c.id === Number(id));
      setCategory(found);
      if (found) {
        setName(found.name);
      }
    });
  }, [params]);

  if (!category) {
    return <div>Chargement...</div>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    category!.name = name;
    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/categories");
    }, 1000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {category.name}</h1>
      {success && (
        <p className="text-green-600 mb-4">Catégorie modifiée avec succès !</p>
      )}
      <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-4 py-2"
        />
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