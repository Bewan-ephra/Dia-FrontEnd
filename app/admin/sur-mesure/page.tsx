"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { getAdminCustomRequests, CustomRequest } from "@/lib/api/custom-requests";
import {
  CUSTOM_REQUEST_STATUSES,
  getCustomStatusColor,
  getCustomStatusLabel,
  effectiveStatus,
} from "@/lib/custom-request-status";
import { formatPrice, formatDate } from "@/lib/format";

export default function SurMesurePage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
        const res = await getAdminCustomRequests({
          status: statusFilter || undefined,
          search: search || undefined,
          page,
        });
        if (cancelled) return;
        setRequests(res.data);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des demandes");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, statusFilter, page]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Demandes sur mesure</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm w-full sm:w-auto sm:flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher (client, titre ou n°)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {CUSTOM_REQUEST_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune demande trouvée.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
              <th className="p-3 font-medium">N°</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Demande</th>
              <th className="p-3 font-medium">Qté</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Devis</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const status = effectiveStatus(r);
              return (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-gray-500 font-mono text-xs">#{r.id}</td>
                  <td className="p-3 font-medium text-gray-900">{r.user?.name ?? "Compte supprimé"}</td>
                  <td className="p-3 text-gray-600">{r.title}</td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3 text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="p-3">{r.quoted_price ? formatPrice(r.quoted_price) : "—"}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCustomStatusColor(status)}`}>
                      {getCustomStatusLabel(status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/sur-mesure/${r.id}`} className="inline-flex text-gray-500 hover:text-blue-600 p-1.5">
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {page} sur {lastPage} · {total} demandes</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || isLoading}
              className="border rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => p + 1)} disabled={page >= lastPage || isLoading}
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