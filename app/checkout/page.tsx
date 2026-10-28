"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, MapPin, X, ShoppingBag, CheckCircle, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import ChampTelephone from "@/components/ChampTelephone";
import {
  getCart,
  getMe,
  getAddresses,
  addAddress,
  getCheckoutQuote,
  placeOrder,
  resendVerificationEmail,
} from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useShopSettings } from "@/lib/useShopSettings";
import { depositLabel } from "@/lib/shop";

function Erreur({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

type DeliveryMode = "livraison" | "retrait";
type PaymentMethod = "" | "airtel_money" | "moov_money";

const PAYMENTS: { value: "airtel_money" | "moov_money"; label: string }[] = [
  { value: "airtel_money", label: "Paiement via Airtel Money" },
  { value: "moov_money", label: "Paiement via Moov Money" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const settings = useShopSettings();

  const [cart, setCart] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [quote, setQuote] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("livraison");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const [result, setResult] = useState<any>(null);

  function bordure(nom: string) {
    return errors[nom] ? "border-red-500" : "border-gray-300";
  }

  function effacerErreur(nom: string) {
    setErrors((prev) => ({ ...prev, [nom]: "" }));
  }

  // Chargement : panier, compte et adresses enregistrées
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/connexion");
      return;
    }

    Promise.all([getCart(token), getMe(token), getAddresses().catch(() => [])])
      .then(([cartData, me, addresses]) => {
        setCart(cartData);
        setUser(me);
        setSavedAddresses(addresses);

        const [first, ...rest] = String(me.name ?? "").trim().split(" ");
        setFirstName(first ?? "");
        setLastName(rest.join(" "));
        if (me.phone) setPhone(me.phone);
      })
      .catch((err: Error) => {
        if (err.message.startsWith("Session expirée")) {
          router.replace("/connexion");
        } else {
          setLoadError(err.message || "Impossible de charger ta commande.");
        }
      });
  }, [router]);

  // Les montants viennent toujours du serveur
  useEffect(() => {
    if (!cart || cart.cart.items.length === 0) return;
    let cancelled = false;

    getCheckoutQuote({
      delivery_mode: deliveryMode,
      payment_method: paymentMethod || null,
      coupon_code: appliedCoupon,
    })
      .then((q: any) => {
        if (!cancelled) setQuote(q);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Le code n'est plus valable (ex. minimum d'achat) : on repart sans code
        setCouponError(err.message);
        setAppliedCoupon(null);
      });

    return () => {
      cancelled = true;
    };
  }, [cart, deliveryMode, paymentMethod, appliedCoupon]);

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError(null);

    try {
      await getCheckoutQuote({
        delivery_mode: deliveryMode,
        payment_method: paymentMethod || null,
        coupon_code: code,
      });
      setAppliedCoupon(code);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Code invalide.");
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  function applySavedAddress(id: string) {
    const found = savedAddresses.find((a) => String(a.id) === id);
    if (!found) return;
    setAddress(found.street);
    setCity(found.city);
    if (found.phone) setPhone(found.phone);
    setErrors((prev) => ({ ...prev, address: "", city: "", phone: "" }));
  }

  async function handleResend() {
    try {
      await resendVerificationEmail();
      setResent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Impossible de renvoyer l'e-mail.");
    }
  }

  function validate() {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = "Le prénom est obligatoire.";
    if (!lastName.trim()) e.lastName = "Le nom est obligatoire.";

    if (deliveryMode === "livraison") {
      if (!address.trim()) e.address = "L'adresse est obligatoire.";
      if (!city.trim()) e.city = "La ville est obligatoire.";
    }

    if (phone.replace(/\D/g, "").length < 8) {
      e.phone = "Entre un numéro de téléphone valide.";
    }

    if (!paymentMethod) e.payment = "Choisis un mode de paiement.";

    if (!cart || cart.cart.items.length === 0) e.cart = "Ton panier est vide.";

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setTimeout(() => {
        document
          .querySelector(".border-red-500")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await placeOrder({
        delivery_mode: deliveryMode,
        payment_method: paymentMethod,
        shipping_name: `${firstName.trim()} ${lastName.trim()}`,
        shipping_phone: phone,
        shipping_address: deliveryMode === "livraison" ? address.trim() : undefined,
        shipping_city: deliveryMode === "livraison" ? city.trim() : undefined,
        coupon_code: appliedCoupon ?? undefined,
      });

      const alreadySaved = savedAddresses.some(
        (a) => a.street === address.trim() && a.city === city.trim()
      );
      if (deliveryMode === "livraison" && saveAddress && !alreadySaved) {
        await addAddress({
          label: "Maison",
          street: address.trim(),
          city: city.trim(),
          phone: phone || null,
        }).catch(() => {});
      }

      window.dispatchEvent(new Event("cart:updated"));
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Impossible de valider la commande.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const items: any[] = cart?.cart.items ?? [];
  const isEmpty = !!cart && items.length === 0;
  const isUnverified = !!user && !user.email_verified_at;

  // Pendant le premier calcul serveur, on affiche le sous-total du panier
  const subtotal = quote ? Number(quote.subtotal) : Number(cart?.total ?? 0);
  const discount = quote ? Number(quote.discount) : 0;
  const shippingFee = quote ? Number(quote.shipping_fee) : 0;
  const total = quote ? Number(quote.total) : subtotal;
  const deposit = quote ? Number(quote.deposit_amount) : 0;
  const balance = quote ? Number(quote.balance) : 0;
  const freeFrom = quote ? Number(quote.free_shipping_from) : 0;

  const balanceLabel = deliveryMode === "retrait" ? "Solde au retrait" : "Solde à la livraison";

  if (loadError) {
    return <div className="p-8 text-red-600">{loadError}</div>;
  }

  if (!cart) {
    return <div className="p-8 text-gray-600">Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            {result ? (
              <div className="border border-green-200 bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-2 text-green-700 font-bold mb-3">
                  <CheckCircle size={20} />
                  Commande #{result.order.id} enregistrée
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Pour la confirmer, un acompte de{" "}
                  <span className="font-bold">{formatPrice(result.order.deposit_amount)}</span> est
                  demandé. Vous recevrez un lien de paiement sécurisé par WhatsApp.
                </p>
                <p className="text-sm text-gray-700 mb-5">
                  {balanceLabel} :{" "}
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
                      <MessageCircle size={16} />
                      Écrire à la boutique sur WhatsApp
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
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {isUnverified && (
                  <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
                    Ton adresse e-mail n&apos;est pas encore vérifiée : il faut la confirmer pour
                    pouvoir commander.{" "}
                    {resent ? (
                      "E-mail renvoyé, vérifie ta boîte de réception."
                    ) : (
                      <button type="button" onClick={handleResend} className="underline">
                        Renvoyer l&apos;e-mail
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <h2 className="font-bold text-gray-900 mb-3">Contact</h2>
                  <p className="text-sm text-gray-600">
                    Commande au nom de <span className="font-medium">{user?.email}</span>
                  </p>
                </div>

                <div>
                  <h2 className="font-bold text-gray-900 mb-3">Livraison</h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("livraison")}
                      className={`flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium ${
                        deliveryMode === "livraison"
                          ? "border-gray-500 bg-gray-100 text-black"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <Truck size={16} />
                      Expédier
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("retrait")}
                      className={`flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium ${
                        deliveryMode === "retrait"
                          ? "border-gray-500 bg-gray-100 text-black"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <MapPin size={16} />
                      Retrait
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h2 className="font-bold text-gray-900 mb-1 mt-2">Coordonnées</h2>

                    {deliveryMode === "livraison" && savedAddresses.length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => applySavedAddress(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900"
                      >
                        <option value="">Utiliser une adresse enregistrée</option>
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label} — {a.street}, {a.city}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Prénom"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            effacerErreur("firstName");
                          }}
                          className={`border rounded-lg px-4 py-3 w-full text-gray-900 ${bordure("firstName")}`}
                        />
                        <Erreur message={errors.firstName} />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Nom"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            effacerErreur("lastName");
                          }}
                          className={`border rounded-lg px-4 py-3 w-full text-gray-900 ${bordure("lastName")}`}
                        />
                        <Erreur message={errors.lastName} />
                      </div>
                    </div>

                    {deliveryMode === "livraison" && (
                      <>
                        <div>
                          <input
                            type="text"
                            placeholder="Adresse"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              effacerErreur("address");
                            }}
                            className={`border rounded-lg px-4 py-3 w-full text-gray-900 ${bordure("address")}`}
                          />
                          <Erreur message={errors.address} />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Ville"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              effacerErreur("city");
                            }}
                            className={`border rounded-lg px-4 py-3 w-full text-gray-900 ${bordure("city")}`}
                          />
                          <Erreur message={errors.city} />
                        </div>
                      </>
                    )}

                    <div>
                      <ChampTelephone
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          effacerErreur("phone");
                        }}
                        erreur={!!errors.phone}
                      />
                      <Erreur message={errors.phone} />
                    </div>

                    {deliveryMode === "livraison" && (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                        />
                        Sauvegarder mes coordonnées pour la prochaine fois
                      </label>
                    )}
                  </div>
                </div>

                {deliveryMode === "livraison" ? (
                  <div>
                    <h2 className="font-bold text-gray-900 mb-3">Mode d&apos;expédition</h2>
                    <div className="border border-blue-600 bg-blue-50 rounded-lg flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-gray-900">Tarif partout à Libreville</p>
                      <p className="text-sm text-gray-900">
                        {shippingFee === 0 ? "Offerte" : formatPrice(shippingFee)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-sm mb-3">
                      Il y a 1 emplacement disponible pour votre article
                    </p>
                    <div className="border border-gray-300 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {settings.pickup_label}
                        </p>
                        <p className="text-green-600 text-sm font-medium">GRATUIT</p>
                      </div>
                      <p className="text-gray-400 text-xs">{settings.pickup_note}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="font-bold text-gray-900 mb-1">Paiement</h2>
                  <p className="text-gray-500 text-sm mb-3">
                    Toutes les transactions sont sécurisées et chiffrées.
                  </p>
                  <div className={`border rounded-lg overflow-hidden ${bordure("payment")}`}>
                    {PAYMENTS.map((p, index) => (
                      <div key={p.value}>
                        <label
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                            index === 0 ? "border-b border-gray-300" : ""
                          } ${paymentMethod === p.value ? "bg-blue-50" : ""}`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === p.value}
                            onChange={() => {
                              setPaymentMethod(p.value);
                              effacerErreur("payment");
                            }}
                          />
                          <span className="text-sm font-medium text-gray-900">{p.label}</span>
                        </label>
                        {paymentMethod === p.value && (
                          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            Paiement obligatoire pour confirmer votre commande. Acompte de{" "}
                            <span className="font-semibold">{formatPrice(deposit)}</span> ({depositLabel(settings.deposit_rate)} du total) : vous recevrez un lien de paiement sécurisé directement par
                            WhatsApp.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Erreur message={errors.payment} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentInfo(true)}
                  className="text-pink-400 text-sm hover:underline text-left"
                >
                  Mode d&apos;emploi du paiement
                </button>

                <div>
                  <Erreur message={errors.cart} />
                  {submitError && (
                    <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-3 text-sm">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || isUnverified || isEmpty}
                    className="bg-black text-white rounded-lg py-3 w-full font-medium hover:bg-blue-400 disabled:opacity-50"
                  >
                    {isSubmitting ? "Validation en cours..." : "Valider la commande"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="md:col-span-2 bg-gray-50 rounded-xl p-6 h-fit">
            {items.length > 0 ? (
              <>
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Photo src={item.product.image} alt={item.product.name} />
                      <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-gray-500 text-xs">{item.variant.label}</p>
                      )}
                    </div>
                    <p className="text-gray-900 text-sm">{formatPrice(item.line_total)}</p>
                  </div>
                ))}

                <div className="mb-6 mt-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-800">
                      <span>Code « {appliedCoupon} » appliqué</span>
                      <button type="button" onClick={removeCoupon} className="underline">
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Code de réduction"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Valider
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                </div>

                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <p>Sous-total</p>
                  <p>{formatPrice(subtotal)}</p>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700 mb-2">
                    <p>Réduction</p>
                    <p>− {formatPrice(discount)}</p>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <p>{deliveryMode === "retrait" ? "Retrait" : "Expédition"}</p>
                  <p>
                    {shippingFee === 0
                      ? deliveryMode === "retrait"
                        ? "Gratuit"
                        : "Offerte"
                      : formatPrice(shippingFee)}
                  </p>
                </div>
                {deliveryMode === "livraison" && shippingFee > 0 && freeFrom > 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Plus que {formatPrice(freeFrom - (subtotal - discount))} pour la livraison
                    offerte.
                  </p>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-300 pt-4 mt-3">
                  <p>Total</p>
                  <p>{formatPrice(total)}</p>
                </div>

                {paymentMethod && deposit > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                    <div className="flex justify-between text-gray-900 font-medium mb-1">
                      <p>Acompte à payer maintenant</p>
                      <p>{formatPrice(deposit)}</p>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <p>{balanceLabel}</p>
                      <p>{formatPrice(balance)}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag size={28} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Ton panier est vide.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Mode d&apos;emploi du paiement</h3>
              <button onClick={() => setShowPaymentInfo(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pour confirmer votre commande, un acompte correspondant à {depositLabel(settings.deposit_rate)} du montant total
              est demandé. Une fois votre commande validée, nous vous enverrons un lien de paiement
              sécurisé directement par WhatsApp. Le solde restant sera à régler à la livraison ou au
              retrait.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}