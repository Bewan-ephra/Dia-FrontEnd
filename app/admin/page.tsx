"use client";
import { useState, useEffect } from "react";
import { getDashboardStats, DashboardStats } from "@/lib/api/dashboard";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des statistiques");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return <p className="text-gray-500">Chargement du tableau de bord...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Utilisateurs" value={stats.total_users} />
        <StatCard label="Produits" value={stats.total_products} />
        <StatCard label="Commandes" value={stats.total_orders} />
        <StatCard
          label="Chiffre d'affaires total"
          value={`${Number(stats.revenue_total).toFixed(2)} €`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chiffre d'affaires du mois */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Chiffre d'affaires ce mois-ci</h2>
          <p className="text-3xl font-bold text-blue-600">
            {Number(stats.revenue_this_month).toFixed(2)} €
          </p>
        </div>

        {/* Commandes par statut */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Commandes par statut</h2>
          {Object.keys(stats.orders_by_status).length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune commande pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(stats.orders_by_status).map(([status, count]) => (
                <li key={status} className="flex justify-between text-sm">
                  <span>{STATUS_LABELS[status] ?? status}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top produits */}
      <div className="bg-white border rounded-lg p-5 mb-8">
        <h2 className="text-lg font-semibold mb-3">Produits les plus vendus</h2>
        {stats.top_products.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune vente pour le moment.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-2">Produit</th>
                <th className="p-2">Quantité vendue</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_products.map((p) => (
                <tr key={p.product_id} className="border-b text-sm">
                  <td className="p-2">{p.product_name}</td>
                  <td className="p-2">{p.total_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-3">Commandes récentes</h2>
        {stats.recent_orders.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune commande récente.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">Client</th>
                <th className="p-2">Vendeur</th>
                <th className="p-2">Total</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((order) => (
                <tr key={order.id} className="border-b text-sm">
                  <td className="p-2">#{order.id}</td>
                  <td className="p-2">{order.user?.name ?? "—"}</td>
                  <td className="p-2">{order.vendor?.name ?? "—"}</td>
                  <td className="p-2">{Number(order.total).toFixed(2)} €</td>
                  <td className="p-2">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-2 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-800",
    confirmee: "bg-blue-100 text-blue-800",
    expediee: "bg-purple-100 text-purple-800",
    livree: "bg-green-100 text-green-800",
    annulee: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}