"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Clock, DollarSign, Users, XCircle, Scissors, Star } from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/lib/api/dashboard";
import { formatPrice } from "@/lib/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        setStats(await getDashboardStats());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement du dashboard"
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Chargement du dashboard...</p>;
  }

  if (error || !stats) {
    return (
      <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 text-sm">
        {error ?? "Impossible de charger les statistiques."}
      </div>
    );
  }

  const pendingOrders = stats.orders_by_status?.en_attente ?? 0;
  const cancelledOrders = stats.orders_by_status?.annulee ?? 0;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Package size={18} />
            </div>
            <span className="text-sm text-gray-500">Produits</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <Clock size={18} />
            </div>
            <span className="text-sm text-gray-500">Commandes en attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <DollarSign size={18} />
            </div>
            <span className="text-sm text-gray-500">Chiffre d&apos;affaires</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(stats.revenue_total)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Users size={18} />
            </div>
            <span className="text-sm text-gray-500">Clients</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 text-red-600 p-2 rounded-lg">
              <XCircle size={18} />
            </div>
            <span className="text-sm text-gray-500">Commandes annulées</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cancelledOrders}</p>
        </div>

        <Link
          href="/admin/sur-mesure"
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-pink-100 text-pink-600 p-2 rounded-lg">
              <Scissors size={18} />
            </div>
            <span className="text-sm text-gray-500">Demandes sur mesure à chiffrer</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending_custom_requests ?? 0}</p>
        </Link>

        <Link
          href="/admin/avis"
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
              <Star size={18} />
            </div>
            <span className="text-sm text-gray-500">Avis clients</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_reviews ?? 0}</p>
        </Link>
      </div>
    </div>
  );
}