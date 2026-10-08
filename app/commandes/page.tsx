"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { myOrders } from "@/lib/myOrders";
import { Clock, CheckCircle, XCircle, ChevronRight, ShoppingBag, Package } from "lucide-react";
import Image from "next/image";
import { resolveOrderItem } from "@/lib/api";

const statusConfig: { [key: string]: { color: string; icon: any } } = {
  "En attente": { color: "bg-amber-100 text-amber-700", icon: Clock },
  "Livrée": { color: "bg-green-100 text-green-700", icon: CheckCircle },
  "Annulée": { color: "bg-red-100 text-red-700", icon: XCircle },
};

const tabs = ["Toutes", "En attente", "Livrée", "Annulée"];

export default function MesCommandesPage() {
  const [activeTab, setActiveTab] = useState("Toutes");

  const filteredOrders =
    activeTab === "Toutes"
      ? myOrders
      : myOrders.filter((order) => order.status === activeTab);

  function countFor(tab: string) {
    if (tab === "Toutes") return myOrders.length;
    return myOrders.filter((order) => order.status === tab).length;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mes commandes
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Suivez l'état de vos commandes et retrouvez votre historique.
          </p>

          <div className="flex gap-2 flex-wrap mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  activeTab === tab
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                }`}
              >
                {tab}
                <span
                  className={`ml-2 text-xs ${
                    activeTab === tab ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {countFor(tab)}
                </span>
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">
                Aucune commande ici
              </p>
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
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status] || {
                  color: "bg-gray-100 text-gray-700",
                  icon: Clock,
                };
                const StatusIcon = config.icon;

                return (
                  <Link
                    key={order.id}
                    href={`/commandes/${order.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          Commande #{order.id}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <StatusIcon size={14} />
                        {order.status}
                      </span>
                    </div>

                   <div className="flex items-center gap-3 mb-4">
  {order.items.slice(0, 4).map((item: any, index: number) => {
    const { name, image } = resolveOrderItem(item);
    return (
      <div
        key={index}
        title={name}
        className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center"
      >
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          <Package size={20} className="text-gray-400" />
        )}
      </div>
    );
  })}
  {order.items.length > 4 && (
    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500 flex-shrink-0">
      +{order.items.length - 4}
    </div>
  )}
  <p className="text-gray-500 text-sm flex-1 line-clamp-2">
    {order.items.map((item: any) => resolveOrderItem(item).name).join(", ")}
  </p>
</div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <p className="text-gray-900">
                        <span className="text-gray-500 text-sm">Total : </span>
                        <span className="font-bold">
                          {order.total.toLocaleString()} FCFA
                        </span>
                      </p>
                      <span className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                        Voir le détail
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}