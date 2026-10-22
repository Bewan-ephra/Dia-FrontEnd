"use client";
import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, Order } from "@/lib/api/orders";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  confirmee: "bg-blue-100 text-blue-800",
  expediee: "bg-purple-100 text-purple-800",
  livree: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getOrders(statusFilter || undefined);
        setOrders(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des commandes");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [statusFilter]);

  async function handleStatusChange(orderId: number, newStatus: string) {
    setUpdatingId(orderId);
    setError(null);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updatedOrder.status } : o))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Commandes</h1>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Chargement des commandes...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Aucune commande trouvée.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Client</th>
              <th className="p-3">Vendeur</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paiement</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date</th>
              <th className="p-3">Détail</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <>
                <tr key={order.id} className="border-b">
                  <td className="p-3">#{order.id}</td>
                  <td className="p-3">{order.user?.name ?? "—"}</td>
                  <td className="p-3">{order.vendor?.name ?? "—"}</td>
                  <td className="p-3">{Number(order.total).toFixed(2)} €</td>
                  <td className="p-3 capitalize">{order.payment_method.replace("_", " ")}</td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`text-xs font-medium rounded px-2 py-1 border-0 ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="text-blue-600"
                    >
                      {expandedId === order.id ? "Masquer" : "Voir"}
                    </button>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr key={`${order.id}-detail`} className="bg-gray-50 border-b">
                    <td colSpan={8} className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Adresse de livraison</p>
                          <p>{order.shipping_address}, {order.shipping_city}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Téléphone</p>
                          <p>{order.shipping_phone}</p>
                        </div>
                        {order.notes && (
                          <div className="sm:col-span-2">
                            <p className="text-gray-500">Notes</p>
                            <p>{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <table className="w-full border-collapse bg-white">
                        <thead>
                          <tr className="bg-gray-100 text-left text-xs text-gray-700">
                            <th className="p-2">Produit</th>
                            <th className="p-2">Prix unitaire</th>
                            <th className="p-2">Quantité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-b text-sm">
                              <td className="p-2">{item.product_name}</td>
                              <td className="p-2">{Number(item.unit_price).toFixed(2)} €</td>
                              <td className="p-2">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}