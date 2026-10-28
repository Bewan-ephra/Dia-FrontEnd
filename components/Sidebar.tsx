"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { logout } from "@/lib/api/auth";
import { useUnreadSummary } from "@/lib/useUnreadSummary";

function Count({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="ml-2 bg-pink-400 text-white text-xs rounded-full px-2 py-0.5">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const summary = useUnreadSummary();

  async function handleLogout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // Token déjà expiré : on déconnecte quand même côté navigateur
    }
    logout();
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
        <Link href="/admin/sur-mesure">Sur mesure</Link>
        <Link href="/admin/avis">Avis</Link>
        <Link href="/admin/messages" className="flex items-center">
          Messages
          <Count n={summary.messages_unread} />
        </Link>
        <Link href="/admin/notifications" className="flex items-center">
          Notifications
          <Count n={summary.notifications_unread} />
        </Link>
      </nav>

      <button onClick={handleLogout} className="mt-auto text-left hover:underline">
        Déconnexion
      </button>
    </aside>
  );
}