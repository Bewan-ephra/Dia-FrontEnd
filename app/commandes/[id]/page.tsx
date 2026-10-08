"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { myOrders } from "@/lib/myOrders";
import { ArrowLeft, Check, Clock, CheckCircle, XCircle, Package, MessageCircle, } from "lucide-react";
import Image from "next/image";
import { resolveOrderItem } from "@/lib/api";

const steps = [
  {
    title: "Commande reçue",
    description: "Votre commande a bien été enregistrée.",
  },
  {
    title: "Acompte confirmé",
    description: "Le paiement de la moitié du montant valide la commande.",
  },
  {
    title: "En préparation",
    description: "Vos articles sont préparés avec soin.",
  },
  {
    title: "Livrée",
    description: "Votre commande est arrivée chez vous.",
  },
];

const statusConfig: { [key: string]: { color: string; icon: any } } = {
  "En attente": { color: "bg-amber-100 text-amber-700", icon: Clock },
  "Livrée": { color: "bg-green-100 text-green-700", icon: CheckCircle },
  "Annulée": { color: "bg-red-100 text-red-700", icon: XCircle },
};

function getCurrentStep(status: string) {
  if (status === "Livrée") return steps.length;
  if (status === "En attente") return 1;
  return 0;
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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const found = myOrders.find((o) => o.id === Number(id));
      if (found) {
        setOrder(found);
      } else {
        setNotFound(true);
      }
    });
  }, [params]);

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen">
          <div className="max-w-3xl mx-auto px-8 py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-2">
              Commande introuvable
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Cette commande n'existe pas ou a été supprimée.
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

  if (!order) {
    return <div>Chargement...</div>;
  }

  const config = statusConfig[order.status] || {
    color: "bg-gray-100 text-gray-700",
    icon: Clock,
  };
  const StatusIcon = config.icon;
  const currentStep = getCurrentStep(order.status);
  const isCancelled = order.status === "Annulée";

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <Link
            href="/commandes"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm mb-6 transition"
          >
            <ArrowLeft size={16} />
            Retour à mes commandes
          </Link>

          <div className="bg-gradient-to-br from-black to-black rounded-2xl p-6 text-white relative overflow-hidden mb-8">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500 rounded-full opacity-30 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-orange-400 text-xs font-semibold uppercase mb-1">
                    Commande
                  </p>
                  <p className="text-2xl font-bold">#{order.id}</p>
                  <p className="text-gray-300 text-sm">
                    Passée le {formatDate(order.date)}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                >
                  <StatusIcon size={14} />
                  {order.status}
                </span>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                <p className="text-gray-300 text-sm">Total de la commande</p>
                <p className="text-xl font-bold">
                  {order.total.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>

          <h2 className="font-bold text-gray-900 mb-4">SUIVI DE COMMANDE</h2>

          {isCancelled ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 text-sm">
                  Cette commande a été annulée
                </p>
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
                            ? "bg-orange-400 border-orange-400 text-white"
                            : isCurrent
                            ? "bg-white border-orange-400 text-orange-500"
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
                            isDone ? "bg-orange-400" : "bg-gray-200"
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
                          <span className="ml-2 bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">
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
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="font-bold text-gray-900 mb-4">ARTICLES</h2>
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-8">

           {order.items.map((item: any, index: number) => {
  const { name, quantity, image } = resolveOrderItem(item);
  return (
    <div key={index} className="flex items-center gap-4 p-4">
      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          <Package size={20} className="text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-gray-900 text-sm font-medium">{name}</p>
        <p className="text-gray-500 text-xs">Quantité : {quantity}</p>
      </div>
    </div>
  );
})}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-b-xl">
              <p className="text-gray-500 text-sm">Total</p>
              <p className="font-bold text-gray-900">
                {order.total.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border border-gray-200 rounded-xl p-4">
            <div className="bg-orange-50 text-orange-500 p-2 rounded-full">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                Une question sur cette commande ?
              </p>
              <a href="https://wa.me/24160348225" className="text-blue-600 text-xs hover:underline">
                Un expert vous répond sur WhatsApp
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