"use client";
import { useState, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { getAdminReviews, deleteReview, AdminReview } from "@/lib/api/reviews";
import { formatDate } from "@/lib/format";

export default function AvisPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAdminReviews({ rating: rating || undefined, search: search || undefined, page });
        if (cancelled) return;
        setReviews(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des avis");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, rating, page, reloadKey]);

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer cet avis ? Cette action est irréversible.")) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteReview(id);
      if (reviews.length === 1 && page > 1) setPage((p) => p - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Avis clients</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm w-full sm:w-auto sm:flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher (texte, produit ou client)..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
          />
        </div>
        <select
          value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Toutes les notes</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement des avis...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun avis trouvé.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Produit</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Note</th>
              <th className="p-3 font-medium">Avis</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                <td className="p-3 text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                <td className="p-3 font-medium text-gray-900">{r.product?.name ?? "Produit supprimé"}</td>
                <td className="p-3">
                  <p className="text-gray-900">{r.user?.name ?? "Compte supprimé"}</p>
                  <p className="text-gray-500 text-xs">{r.user?.email}</p>
                </td>
                <td className="p-3 text-yellow-500 whitespace-nowrap">
                  {"★".repeat(r.rating)}
                  <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                </td>
                <td className="p-3 max-w-xs">
                  {r.title && <p className="font-medium text-gray-900">{r.title}</p>}
                  {r.comment && <p className="text-gray-600">{r.comment}</p>}
                  {r.verified_purchase && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      Achat vérifié
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                    className="inline-flex text-gray-500 hover:text-red-600 p-1.5 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {page} sur {lastPage} · {total} avis</span>
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