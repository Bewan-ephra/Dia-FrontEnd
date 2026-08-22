"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {

  const router = useRouter();

  function handleSubmit(){
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  }
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-6">
      <div className="text-2xl font-bold mb-10">DIA Admin</div>
      <nav className="flex flex-col gap-4">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/produits">Produits</Link>
        <Link href="/admin/categories">Catégories</Link>
        <Link href="/admin/commandes">Commandes</Link>
        <Link href="/admin/clients">Clients</Link>
      </nav>

      <button
        onClick={handleSubmit}
        className="mt-auto text-left hover:underline"
      >
        Déconnexion
      </button>
    </aside>
  );
}