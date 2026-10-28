"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, Clock, CheckCircle, XCircle, Truck, Package, MessageCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Photo from "@/components/Photo";
import { getMyOrder } from "@/lib/api";
import {
  getStatusColor,
  getStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getDeliveryModeLabel,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/format";
import { SHOP_WHATSAPP, depositLabel } from "@/lib/shop";
import { useShopSettings } from "@/lib/useShopSettings";

const statusIcons: Record<string, any> = {
  en_attente: Clock,
  confirmee: CheckCircle,
  expediee: Truck,
  livree: CheckCircle,
  annulee: XCircle,
};

function buildSteps(order: any, depositText: string) {
  const pickup = order.delivery_mode === "retrait";

  return [
    {
      title: "Commande reçue",
      description: "Votre commande a bien été enregistrée.",
    },
    {
      title: "Acompte confirmé",
      description: `Le paiement de ${depositText} du montant valide la commande.`,
    },
    {
      title: "En préparation",
      description: "Vos articles sont préparés avec soin.",
    },
    pickup
      ? { title: "Retirée", description: "Vous avez retiré votre commande en magasin." }
      : { title: "Livrée", description: "Votre commande est arrivée chez vous." },
  ];
}

// Index de l'étape en cours (4 = tout est terminé)
function getCurrentStep(order: any) {
  const depositPaid =
    order.payment_status === "acompte_paye" || order.payment_status === "paye";

  if (order.status === "livree") return 4;
  if (order.status === "expediee") return 3;
  if (order.status === "confirmee") return 2;
  return depositPaid ? 2 : 1; // en_attente
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        setOrder(await getMyOrder(Number(id)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Commande introuvable.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  if (isLoading) {
    return <div className="p-8 text-gray-600">Chargement...</div>;
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen">
          <div className="max-w-3xl mx-auto px-8 py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-2">Commande introuvable</p>
            <p className="text-gray-500 text-sm mb-6">
              {error ?? "Cette commande n'existe pas ou a été supprimée."}
            </p>
            <Link
              href="/commandes"
              className="inline-block bg-gray-900 text-white rounded-lg px-6 py-3 font-medium text-sm"
            >
              Retour à mes commandes
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const StatusIcon = statusIcons[order.status] ?? Clock;
  const steps = buildSteps(order);
  const currentStep = getCurrentStep(order);
  const isCancelled = order.status === "annulee";

  const total = Number(order.total);
  const shipping = Number(order.shipping_fee);
  const discount = Number(order.discount);
  const deposit = Number(order.deposit_amount);
  const subtotal = total - shipping + discount;
  const pickup = order.delivery_mode === "retrait";

  const whatsapp = `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(
    `Bonjour, je vous écris au sujet de ma commande #${order.id}.`
  )}`;

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <Link
            href="/commandes"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 text-sm mb-6 transition"
          >
            <ArrowLeft size={16} />
            Retour à mes commandes
          </Link>

          <div className="bg-gradient-to-br from-black to-black rounded-2xl p-6 text-white relative overflow-hidden mb-8">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-400 rounded-full opacity-30 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-pink-400 text-xs font-semibold uppercase mb-1">Commande</p>
                  <p className="text-2xl font-bold">#{order.id}</p>
                  <p className="text-gray-300 text-sm">
                    Passée le {formatDate(order.created_at)}
                  </p>
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

              <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                <p className="text-gray-300 text-sm">Total de la commande</p>
                <p className="text-xl font-bold">{formatPrice(total)}</p>
              </div>
            </div>
          </div>

          <h2 className="font-bold text-gray-900 mb-4">SUIVI DE COMMANDE</h2>

          {isCancelled ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 text-sm">Cette commande a été annulée</p>
                <p className="text-red-600 text-xs">
                  Pour toute question, contactez-nous sur WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              {steps.map((step, index) => {
                const isDone = index < currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isDone
                            ? "bg-pink-400 border-pink-400 text-white"
                            : isCurrent
                            ? "bg-white border-pink-400 text-pink-500"
                            : "bg-white border-gray-200 text-gray-300"
                        }`}
                      >
                        {isDone ? (
                          <Check size={18} />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 min-h-8 ${
                            isDone ? "bg-pink-400" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>

                    <div className="pb-6">
                      <p
                        className={`font-medium ${
                          isDone || isCurrent ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                        {isCurrent && (
                          <span className="ml-2 bg-blue-50 text-pink-600 text-xs px-2 py-0.5 rounded-full">
                            En cours
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-sm ${
                          isDone || isCurrent ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {step.description}
                        {index === 1 && deposit > 0 && ` (${formatPrice(deposit)})`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="font-bold text-gray-900 mb-4">ARTICLES</h2>
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-8">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <Photo src={item.image} alt={item.product_name} />
                  ) : (
                    <Package size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">{item.product_name}</p>
                  <p className="text-gray-500 text-xs">Quantité : {item.quantity}</p>
                </div>
                <p className="text-gray-900 text-sm font-medium">
                  {formatPrice(Number(item.unit_price) * item.quantity)}
                </p>
              </div>
            ))}

            <div className="p-4 bg-gray-50 rounded-b-xl text-sm">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <p>Sous-total</p>
                <p>{formatPrice(subtotal)}</p>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-700 mb-1">
                  <p>Réduction</p>
                  <p>− {formatPrice(discount)}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <p>{pickup ? "Retrait" : "Livraison"}</p>
                <p>{shipping === 0 ? (pickup ? "Gratuit" : "Offerte") : formatPrice(shipping)}</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <p className="text-gray-500">Total</p>
                <p className="font-bold text-gray-900">{formatPrice(total)}</p>
              </div>
              {deposit > 0 && (
                <>
                  <div className="flex items-center justify-between text-gray-500 mt-2">
                    <p>Acompte</p>
                    <p>{formatPrice(deposit)}</p>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <p>{pickup ? "Solde au retrait" : "Solde à la livraison"}</p>
                    <p>{formatPrice(total - deposit)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <h2 className="font-bold text-gray-900 mb-4">LIVRAISON ET PAIEMENT</h2>
          <div className="border border-gray-200 rounded-xl p-4 mb-8 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">{getDeliveryModeLabel(order.delivery_mode)}</p>
              {order.shipping_name && (
                <p className="text-gray-900 font-medium">{order.shipping_name}</p>
              )}
              <p className="text-gray-700">{order.shipping_address}</p>
              {!pickup && <p className="text-gray-700">{order.shipping_city}</p>}
              <p className="text-gray-700">{order.shipping_phone}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Paiement</p>
              <p className="text-gray-900 font-medium mb-1">
                {getPaymentMethodLabel(order.payment_method)}
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                  order.payment_status
                )}`}
              >
                {getPaymentStatusLabel(order.payment_status)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 border border-gray-200 rounded-xl p-4">
            <div className="bg-blue-50 text-pink-400 p-2 rounded-full">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                Une question sur cette commande ?
              </p>
              <Link href={`/messages?commande=${order.id}`} className="text-blue-600 text-xs hover:underline mr-4">
  Écrire à la boutique
</Link>
<a href={whatsapp} className="text-blue-600 text-xs hover:underline">
  Ou sur WhatsApp
</a>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}