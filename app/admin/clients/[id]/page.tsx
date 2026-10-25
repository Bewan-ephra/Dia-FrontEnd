"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserDetail, ClientDetail } from "@/lib/api/users";
import {
  getStatusColor,
  getStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from "@/lib/order-status";
import { formatPrice, formatDate } from "@/lib/format";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setIsLoading(true);
      setError(null);
      try {
        setData(await getUserDetail(Number(id)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du client");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  if (isLoading) return <div>Chargement...</div>;

  if (!data) {
    return (
      <div>
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
            {error}
          </div>
        )}
        <Link href="/admin/clients" className="text-blue-600">
          ← Retour aux clients
        </Link>
      </div>
    );
  }

  const { user, total_spent, orders } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Voir détails : {user.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8 max-w-2xl">
        <div>
          <p className="text-gray-500">Client</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Téléphone</p>
          <p className="font-medium">{user.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Date d&apos;inscription</p>
          <p className="font-medium">{formatDate(user.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500">Nombre de commandes</p>
          <p className="font-medium">{user.orders_count ?? 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Total dépensé (commandes payées)</p>
          <p className="font-medium">{formatPrice(total_spent)}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Dernières commandes</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">Ce client n&apos;a pas encore passé de commande.</p>
      ) : (
        <table className="w-full max-w-2xl border-collapse text-sm mb-6">
          <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
              <th className="p-3 font-medium">N°</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium">Paiement</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/admin/commandes/${order.id}`} className="text-blue-600">
                    #{order.id}
                  </Link>
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link href="/admin/clients" className="text-blue-600">
        ← Retour aux clients
      </Link>
    </div>
  );
}