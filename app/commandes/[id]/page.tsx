"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { myOrders } from "@/lib/myOrders";

function getStatusColor(status: string) {
  if (status === "En attente") return "bg-yellow-100 text-yellow-700";
  if (status === "Livrée") return "bg-green-100 text-green-700";
  if (status === "Annulée") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<any>(undefined);

  useEffect(() => {
    params.then(({ id }) => {
      const found = myOrders.find((o) => o.id === Number(id));
      setOrder(found);
    });
  }, [params]);

  if (!order) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Commande #{order.id}
          </h1>
          <p className="text-gray-500 mb-4">{order.date}</p>

          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-6 ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-medium text-gray-900 mb-3">Articles</h2>
            <ul className="text-gray-600 mb-4">
              {order.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-right font-bold text-gray-900">
              Total : {order.total} FCFA
            </p>
          </div>
        </div>
      </div>
    </>
  );
}