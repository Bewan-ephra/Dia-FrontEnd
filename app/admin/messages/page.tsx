"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getAdminConversations, ConversationRow } from "@/lib/api/inbox";
import { formatDateTime } from "@/lib/format";

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAdminConversations({
          search: search || undefined,
          unread: unreadOnly,
          page,
        });
        if (cancelled) return;
        setRows(res.data);
        setLastPage(res.last_page);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des messages");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, unreadOnly, page]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Messages</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative max-w-sm w-full sm:w-auto sm:flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
          />
          Non lus seulement
        </label>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Aucune conversation. Pour écrire à un client, ouvre sa commande ou sa fiche client.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {rows.map((c) => (
            <Link
              key={c.user_id}
              href={`/admin/messages/${c.user_id}`}
              className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{c.user?.name ?? "Compte supprimé"}</p>
                <p className="text-gray-500 text-sm truncate">
                  {c.last_message?.from_admin ? "Vous : " : ""}
                  {c.last_message?.body}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {c.last_message_at && (
                  <p className="text-gray-400 text-xs">{formatDateTime(c.last_message_at)}</p>
                )}
                {c.unread_count > 0 && (
                  <span className="inline-block mt-1 bg-pink-400 text-white text-xs rounded-full px-2 py-0.5">
                    {c.unread_count} non lu{c.unread_count > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {page} sur {lastPage}</span>
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