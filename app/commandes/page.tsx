"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, Truck, ChevronRight, ShoppingBag, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Photo from "@/components/Photo";
import { getMyOrders, getMyOrderCounts } from "@/lib/api";
import { ORDER_STATUSES, getStatusColor, getStatusLabel } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";

const statusIcons: Record<string, any> = {
  en_attente: Clock,
  confirmee: CheckCircle,
  expediee: Truck,
  livree: CheckCircle,
  annulee: XCircle,
};

const tabs = [{ value: "", label: "Toutes" }, ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MesCommandesPage() {
  const [activeTab, setActiveTab] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyOrderCounts().then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getMyOrders({ status: activeTab, page: 1 })
      .then((res: any) => {
        if (cancelled) return;
        setOrders(res.data);
        setPage(1);
        setLastPage(res.meta?.last_page ?? 1);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Impossible de charger tes commandes.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  async function loadMore() {
    const next = page + 1;
    setIsLoadingMore(true);
    try {
      const res: any = await getMyOrders({ status: activeTab, page: next });
      setOrders((prev) => [...prev, ...res.data]);
      setPage(next);
      setLastPage(res.meta?.last_page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la suite.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function countFor(tab: string) {
    return tab === "" ? counts.all ?? 0 : counts[tab] ?? 0;
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes commandes</h1>
          <p className="text-gray-500 text-sm mb-8">
            Suivez l&apos;état de vos commandes et retrouvez votre historique.
          </p>

          <div className="flex gap-2 flex-wrap mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  activeTab === tab.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 text-xs ${
                    activeTab === tab.value ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {countFor(tab.value)}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">Aucune commande ici</p>
              <p className="text-gray-500 text-sm mb-6">
                Aucune commande ne correspond à ce filtre pour le moment.
              </p>
              <Link
                href="/produits"
                className="inline-block bg-gray-900 text-white rounded-lg px-6 py-3 font-medium text-sm"
              >
                Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] ?? Clock;
                const items: any[] = order.items ?? [];

                return (
                  <Link
                    key={order.id}
                    href={`/commandes/${order.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-gray-900">Commande #{order.id}</p>
                        <p className="text-gray-500 text-sm">{formatDate(order.created_at)}</p>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <StatusIcon size={14} />
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          title={item.product_name}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center"
                        >
                          {item.image ? (
                            <Photo src={item.image} alt={item.product_name} />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                      ))}
                      {items.length > 4 && (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500 flex-shrink-0">
                          +{items.length - 4}
                        </div>
                      )}
                      <p className="text-gray-500 text-sm flex-1 line-clamp-2">
                        {items.map((item) => item.product_name).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <p className="text-gray-900">
                        <span className="text-gray-500 text-sm">Total : </span>
                        <span className="font-bold">{formatPrice(order.total)}</span>
                      </p>
                      <span className="flex items-center gap-1 text-pink-500 text-sm font-medium">
                        Voir le détail
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </Link>
                );
              })}

              {page < lastPage && (
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="border border-black text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 self-center"
                >
                  {isLoadingMore ? "Chargement..." : "Voir plus de commandes"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}