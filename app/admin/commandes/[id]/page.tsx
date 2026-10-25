"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrder, updateOrder, Order } from "@/lib/api/orders";
import {
  ORDER_STATUSES,
  getStatusColor,
  getStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/lib/order-status";
import { formatPrice, formatDate } from "@/lib/format";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrder(Number(id));
        setOrder(data);
        setStatus(data.status);
        setPaymentStatus(data.payment_status);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement de la commande"
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;

    setIsSaving(true);
    setError(null);
    try {
      await updateOrder(order.id, { status, payment_status: paymentStatus });
      setOrder({ ...order, status, payment_status: paymentStatus });
      setSuccess(true);
      setTimeout(() => router.push("/admin/commandes"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div>Chargement...</div>;

  if (!order) {
    return (
      <div>
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
            {error}
          </div>
        )}
        <Link href="/admin/commandes" className="text-blue-600">
          ← Retour aux commandes
        </Link>
      </div>
    );
  }

  const hasDiscount = Number(order.discount) > 0;
  const hasChanges =
    status !== order.status || paymentStatus !== order.payment_status;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Commande #{order.id} de {order.user?.name ?? "compte supprimé"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6 max-w-2xl">
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-medium">{formatDate(order.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500">Total</p>
          <p className="font-medium">
            {formatPrice(order.total)}
            {hasDiscount && (
              <span className="text-gray-500 font-normal">
                {" "}
                (remise : {formatPrice(order.discount)})
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Mode de commande</p>
          <p className="font-medium">{getPaymentMethodLabel(order.payment_method)}</p>
        </div>
        <div>
          <p className="text-gray-500">Paiement</p>
          <p className="font-medium">{getPaymentStatusLabel(order.payment_status)}</p>
        </div>
        <div>
          <p className="text-gray-500">Adresse de livraison</p>
          <p className="font-medium">
            {order.shipping_address}, {order.shipping_city}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Téléphone</p>
          <p className="font-medium">{order.shipping_phone}</p>
        </div>
        {order.vendor && (
          <div>
            <p className="text-gray-500">Vendeur</p>
            <p className="font-medium">{order.vendor.name}</p>
          </div>
        )}
        {order.notes && (
          <div className="sm:col-span-2">
            <p className="text-gray-500">Notes du client</p>
            <p className="font-medium">{order.notes}</p>
          </div>
        )}
      </div>

      <table className="w-full max-w-2xl border-collapse text-sm mb-8">
        <thead>
          <tr className="border-b bg-gray-200 text-left text-gray-500">
            <th className="p-3 font-medium">Produit</th>
            <th className="p-3 font-medium">Prix unitaire</th>
            <th className="p-3 font-medium">Quantité</th>
            <th className="p-3 font-medium text-right">Sous-total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="p-3 font-medium text-gray-900">{item.product_name}</td>
              <td className="p-3">{formatPrice(item.unit_price)}</td>
              <td className="p-3">{item.quantity}</td>
              <td className="p-3 text-right">
                {formatPrice(Number(item.unit_price) * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-2">
        Statut actuel :{" "}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mt-4 max-w-sm">
          {error}
        </div>
      )}
      {success && (
        <p className="text-green-600 mt-4">Commande mise à jour avec succès !</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mt-4">
        <label className="font-medium">Statut de la commande</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-4 py-2"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="font-medium">Paiement</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="non_paye">Non payé</option>
          <option value="paye">Payé</option>
          <option value="echoue">Échoué</option>
        </select>

        <button
          type="submit"
          disabled={isSaving || !hasChanges}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}