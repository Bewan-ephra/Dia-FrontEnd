"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { getOrders, Order } from "@/lib/api/orders";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  getStatusColor,
  getStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from "@/lib/order-status";
import { formatPrice, formatDate } from "@/lib/format";

function summarizeItems(order: Order) {
  if (order.items.length === 0) return "—";
  const first = order.items[0].product_name;
  if (order.items.length === 1) return first;
  const others = order.items.length - 1;
  return `${first} +${others} autre${others > 1 ? "s" : ""}`;
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Debounce : on attend 400 ms après la dernière frappe avant d'appeler l'API
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getOrders({
          status: statusFilter || undefined,
          payment_status: paymentFilter || undefined,
          search: search || undefined,
          page,
        });
        if (cancelled) return;
        setOrders(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des commandes"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, statusFilter, paymentFilter, page]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Commandes</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm w-full sm:w-auto sm:flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher (client ou n° de commande)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Tous les paiements</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement des commandes...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune commande trouvée.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
              <th className="p-3 font-medium">N°</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Produits</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium">Paiement</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-500 font-mono text-xs">#{order.id}</td>
                <td className="p-3 font-medium text-gray-900">
                  {order.user?.name ?? "Compte supprimé"}
                </td>
                <td className="p-3 text-gray-600">{summarizeItems(order)}</td>
                <td className="p-3 text-gray-500">{formatDate(order.created_at)}</td>
                <td className="p-3">{formatPrice(order.total)}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                      order.payment_status
                    )}`}
                  >
                    {getPaymentStatusLabel(order.payment_status)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/commandes/${order.id}`}
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
            Page {page} sur {lastPage} · {total} commandes
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