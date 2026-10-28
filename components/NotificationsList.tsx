"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  InboxNotification,
} from "@/lib/api/inbox";
import { formatDateTime } from "@/lib/format";

export default function NotificationsList() {
  const router = useRouter();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotifications(1)
      .then((res) => {
        setItems(res.data);
        setLastPage(res.last_page);
      })
      .catch((err: Error) => setError(err.message || "Impossible de charger les notifications."))
      .finally(() => setIsLoading(false));
  }, []);

  async function loadMore() {
    const next = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await getNotifications(next);
      setItems((prev) => [...prev, ...res.data]);
      setPage(next);
      setLastPage(res.last_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la suite.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function open(n: InboxNotification) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      markNotificationRead(n.id)
        .then(() => window.dispatchEvent(new Event("inbox:updated")))
        .catch(() => {});
    }
    if (n.url) router.push(n.url);
  }

  async function readAll() {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      window.dispatchEvent(new Event("inbox:updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de marquer comme lu.");
    }
  }

  const hasUnread = items.some((n) => !n.read);

  return (
    <div>
      {hasUnread && (
        <button onClick={readAll} className="text-blue-600 text-sm hover:underline mb-4">
          Tout marquer comme lu
        </button>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune notification pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={`text-left rounded-xl border p-4 transition hover:border-blue-300 ${
                n.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.read ? "bg-transparent" : "bg-pink-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-600 text-sm">{n.body}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            </button>
          ))}

          {page < lastPage && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="border border-black text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 self-center"
            >
              {isLoadingMore ? "Chargement..." : "Voir plus"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}