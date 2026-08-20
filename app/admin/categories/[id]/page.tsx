import { categories } from "@/lib/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = categories.find((c) => c.id === Number(id));

  if (!category) {
    return <div>Catégorie introuvable</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {category.name}</h1>
    </div>
  );
}