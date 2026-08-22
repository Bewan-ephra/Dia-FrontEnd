"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { orders } from "@/lib/orders";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<typeof orders[0] | undefined>(undefined);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const found = orders.find((o) => o.id === Number(id));
      setOrder(found);
      if (found) {
        setStatus(found.status);
      }
    });
  }, [params]);

  if (!order) {
    return <div>Chargement...</div>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    order!.status = status;
    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/commandes");
    }, 1000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commande de {order.name}</h1>
      <p>Date : {order.date}</p>
      <p>Total : {order.total} FCFA</p>

      {success && (
        <p className="text-green-600 mt-4">Statut mis à jour avec succès !</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mt-4">
        <label className="font-medium">Statut de la commande</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="En attente">En attente</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Enregistrer le statut
        </button>
      </form>
    </div>
  );
}