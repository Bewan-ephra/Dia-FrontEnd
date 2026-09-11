"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { myOrders } from "@/lib/myOrders";

function getStatusColor(status: string) {
  if (status === "En attente") return "bg-yellow-100 text-yellow-700";
  if (status === "Livrée") return "bg-green-100 text-green-700";
  if (status === "Annulée") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function MesCommandesPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Mes commandes
          </h1>

          <div className="flex flex-col gap-4">
            {myOrders.map((order) => (
              <Link
                key={order.id}
                href={`/commandes/${order.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Commande #{order.id}
                  </p>
                  <p className="text-gray-500 text-sm">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="font-medium text-gray-900">
                    {order.total} FCFA
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}