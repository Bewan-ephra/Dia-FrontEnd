"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { getUsers, UserWithRoles } from "@/lib/api/users";
import { formatDate } from "@/lib/format";

export default function ClientsPage() {
  const [clients, setClients] = useState<UserWithRoles[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getUsers({ role: "client", search: search || undefined, page });
        if (cancelled) return;
        setClients(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des clients"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, page]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Clients</h1>

      <div className="relative mb-4 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Rechercher un client (nom ou email)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement des clients...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun client trouvé.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Date d&apos;inscription</th>
              <th className="p-3 font-medium">Nombres commandes</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{client.name}</td>
                <td className="p-3 text-gray-500">{client.email}</td>
                <td className="p-3 text-gray-500">{formatDate(client.created_at)}</td>
                <td className="p-3">{client.orders_count ?? 0}</td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="inline-flex text-gray-500 hover:text-blue-600 p-1.5"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            Page {page} sur {lastPage} · {total} clients
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || isLoading}
              className="border rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= lastPage || isLoading}
              className="border rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}