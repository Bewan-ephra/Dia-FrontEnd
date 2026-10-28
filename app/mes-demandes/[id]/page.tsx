"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MessageCircle, Truck, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ChampTelephone from "@/components/ChampTelephone";
import {
  getMyCustomRequest,
  previewCustomRequest,
  acceptCustomRequest,
  cancelCustomRequest,
  CustomRequest,
  QuotePreview,
} from "@/lib/api/custom-requests";
import { getCustomStatusColor, getCustomStatusLabel, effectiveStatus } from "@/lib/custom-request-status";
import { getCurrentUser } from "@/lib/api/auth";
import { formatPrice, formatDate } from "@/lib/format";

type DeliveryMode = "livraison" | "retrait";
type PaymentMethod = "" | "airtel_money" | "moov_money";

const PAYMENTS = [
  { value: "airtel_money", label: "Paiement via Airtel Money" },
  { value: "moov_money", label: "Paiement via Moov Money" },
] as const;

const inputClass = "border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900";

export default function DemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("livraison");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [preview, setPreview] = useState<QuotePreview | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        setRequest(await getMyCustomRequest(Number(id)));
        const user = getCurrentUser();
        if (user?.name) setName(user.name);
        if (user?.phone) setPhone(user.phone);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Demande introuvable.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  // Les montants viennent toujours du serveur
  useEffect(() => {
    if (!request || request.status !== "devis_envoye") return;
    let cancelled = false;

    previewCustomRequest(request.id, {
      delivery_mode: deliveryMode,
      payment_method: paymentMethod || null,
    })
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [request, deliveryMode, paymentMethod]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setFormError(null);

    if (!name.trim()) return setFormError("Le nom du destinataire est obligatoire.");
    if (phone.replace(/\D/g, "").length < 8) return setFormError("Entrez un numéro de téléphone valide.");
    if (deliveryMode === "livraison" && (!address.trim() || !city.trim())) {
      return setFormError("L'adresse et la ville sont obligatoires pour une livraison.");
    }
    if (!paymentMethod) return setFormError("Choisissez un mode de paiement.");

    setIsSubmitting(true);
    try {
      const res = await acceptCustomRequest(request.id, {
        expected_price: Number(request.quoted_price),
        delivery_mode: deliveryMode,
        payment_method: paymentMethod,
        shipping_name: name.trim(),
        shipping_phone: phone,
        shipping_address: deliveryMode === "livraison" ? address.trim() : undefined,
        shipping_city: deliveryMode === "livraison" ? city.trim() : undefined,
      });
      setResult(res);
      setRequest({ ...request, status: "acceptee", order_id: res.order.id });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'accepter le devis.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!request) return;
    if (!window.confirm("Annuler cette demande ?")) return;

    try {
      setRequest(await cancelCustomRequest(request.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'annuler la demande.");
    }
  }

  if (isLoading) return <div className="p-8 text-gray-600">Chargement...</div>;

  const back = (
    <Link href="/mes-demandes" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 text-sm mb-6">
      <ArrowLeft size={16} /> Mes demandes
    </Link>
  );

  if (!request) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-8 py-12">
          {back}
          <p className="text-red-600">{error ?? "Demande introuvable."}</p>
        </div>
        <Footer />
      </>
    );
  }

  const quoted = request.status === "devis_envoye";
  const expired = !!request.is_expired;
  const open = request.status === "en_attente" || quoted;

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {back}

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">{error}</div>
          )}

          {result && (
            <div className="border border-green-200 bg-green-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                <CheckCircle size={20} />
                Devis accepté · commande #{result.order.id}
              </div>
              <p className="text-sm text-gray-700 mb-1">
                Pour lancer la confection, un acompte de{" "}
                <span className="font-bold">{formatPrice(result.order.deposit_amount)}</span> est
                demandé. Vous recevrez un lien de paiement sécurisé par WhatsApp.
              </p>
              <p className="text-sm text-gray-700 mb-5">
                Solde :{" "}
                <span className="font-bold">
                  {formatPrice(Number(result.order.total) - Number(result.order.deposit_amount))}
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                {result.whatsapp_link && (
                  <a
                    href={result.whatsapp_link}
                    className="flex items-center gap-2 bg-black text-white rounded-lg px-5 py-3 text-sm font-medium hover:bg-blue-400"
                  >
                    <MessageCircle size={16} /> Écrire à la boutique sur WhatsApp
                  </a>
                )}
                <Link
                  href={`/commandes/${result.order.id}`}
                  className="border border-black text-black rounded-lg px-5 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  Voir ma commande
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
              <p className="text-gray-500 text-sm">
                Demande #{request.id} · envoyée le {formatDate(request.created_at)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCustomStatusColor(effectiveStatus(request))}`}>
  {getCustomStatusLabel(effectiveStatus(request))}
</span>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 mb-6 text-sm">
            <p className="text-gray-700 whitespace-pre-line mb-4">{request.description}</p>
            <div className="grid grid-cols-2 gap-3 text-gray-600">
              {request.product && <p>Modèle : <span className="text-gray-900">{request.product.name}</span></p>}
              {request.color && <p>Couleur : <span className="text-gray-900">{request.color}</span></p>}
              {request.size_info && <p>Taille / mesures : <span className="text-gray-900">{request.size_info}</span></p>}
              <p>Quantité : <span className="text-gray-900">{request.quantity}</span></p>
              {request.desired_date && <p>Pour le : <span className="text-gray-900">{formatDate(request.desired_date)}</span></p>}
            </div>
            {request.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {request.images.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {request.status === "en_attente" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900 mb-6">
              Nous étudions votre demande. Vous recevrez un devis (prix et délai) ici même.
            </div>
          )}

          {request.status === "rejetee" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-6">
              <p className="font-medium mb-1">Nous ne pouvons pas réaliser cette demande.</p>
              {request.admin_note && <p>{request.admin_note}</p>}
            </div>
          )}

          {request.status === "acceptee" && request.order_id && !result && (
            <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-sm mb-6">
              Devis accepté.{" "}
              <Link href={`/commandes/${request.order_id}`} className="text-blue-600 hover:underline">
                Voir la commande #{request.order_id}
              </Link>
            </div>
          )}

          {quoted && (
            <>
              <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6">
                <p className="text-pink-400 text-xs font-semibold uppercase mb-1">Votre devis</p>
                <p className="text-3xl font-bold mb-2">{formatPrice(request.quoted_price ?? 0)}</p>
                {request.lead_time_days && (
                  <p className="text-gray-300 text-sm">Délai de confection : {request.lead_time_days} jours</p>
                )}
                {request.valid_until && (
                  <p className={`text-sm mt-1 ${expired ? "text-orange-300" : "text-gray-300"}`}>
                    {expired ? "Ce devis a expiré le " : "Valable jusqu'au "}
                    {formatDate(request.valid_until)}
                  </p>
                )}
                {request.admin_note && <p className="text-gray-200 text-sm mt-3">{request.admin_note}</p>}
              </div>

              {expired && (
  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-900 mb-6">
    Ce devis n&apos;est plus valable.{" "}
    <Link href={`/messages?demande=${request.id}`} className="underline">
      Écrivez-nous
    </Link>{" "}
    pour obtenir un nouveau devis.
  </div>
)}

            {!expired && ( 
                <form onSubmit={handleAccept} className="flex flex-col gap-4 mb-6">
                <h2 className="font-bold text-gray-900">Accepter le devis</h2>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "livraison", label: "Expédier", icon: Truck },
                    { value: "retrait", label: "Retrait", icon: MapPin },
                  ] as const).map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.value} type="button" onClick={() => setDeliveryMode(mode.value)}
                        className={`flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium ${
                          deliveryMode === mode.value
                            ? "border-gray-500 bg-gray-100 text-black"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        <Icon size={16} /> {mode.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text" placeholder="Nom du destinataire" value={name}
                  onChange={(e) => setName(e.target.value)} className={inputClass}
                />
                {deliveryMode === "livraison" && (
                  <>
                    <input
                      type="text" placeholder="Adresse" value={address}
                      onChange={(e) => setAddress(e.target.value)} className={inputClass}
                    />
                    <input
                      type="text" placeholder="Ville" value={city}
                      onChange={(e) => setCity(e.target.value)} className={inputClass}
                    />
                  </>
                )}
                <ChampTelephone value={phone} onChange={(e) => setPhone(e.target.value)} />

                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {PAYMENTS.map((p, index) => (
                    <label
                      key={p.value}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                        index === 0 ? "border-b border-gray-300" : ""
                      } ${paymentMethod === p.value ? "bg-blue-50" : ""}`}
                    >
                      <input
                        type="radio" name="payment" checked={paymentMethod === p.value}
                        onChange={() => setPaymentMethod(p.value)}
                      />
                      <span className="text-sm font-medium text-gray-900">{p.label}</span>
                    </label>
                  ))}
                </div>

                {preview && (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm">
                    <div className="flex justify-between text-gray-700 mb-1">
                      <p>Devis</p><p>{formatPrice(preview.subtotal)}</p>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-2">
                      <p>{deliveryMode === "retrait" ? "Retrait" : "Livraison"}</p>
                      <p>
                        {preview.shipping_fee === 0
                          ? deliveryMode === "retrait" ? "Gratuit" : "Offerte"
                          : formatPrice(preview.shipping_fee)}
                      </p>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                      <p>Total</p><p>{formatPrice(preview.total)}</p>
                    </div>
                    {paymentMethod && preview.deposit_amount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-gray-900 font-medium">
                          <p>Acompte à payer maintenant</p><p>{formatPrice(preview.deposit_amount)}</p>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <p>{deliveryMode === "retrait" ? "Solde au retrait" : "Solde à la livraison"}</p>
                          <p>{formatPrice(preview.balance)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formError && (
                  <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{formError}</div>
                )}

                <button
                  type="submit" disabled={isSubmitting}
                  className="bg-black text-white rounded-lg py-3 font-medium hover:bg-blue-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Validation..." : "Accepter le devis et commander"}
                </button>
              </form>
             )}
              
            </>
          )}

            <Link href={`/messages?demande=${request.id}`} className="text-blue-600 text-sm hover:underline mr-6">
  Poser une question à la boutique
</Link>
          {open && (
            <button onClick={handleCancel} className="text-red-600 hover:text-red-700 text-sm font-medium">
              Annuler cette demande
            </button>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}