"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getCart, getCategoryImage } from "@/lib/api";
import { Truck, MapPin, X, ShoppingBag } from "lucide-react";
import ChampTelephone from "@/components/ChampTelephone";

function Erreur({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [deliveryMode, setDeliveryMode] = useState<"shipping" | "pickup">("shipping");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  function bordure(nom: string) {
    return errors[nom] ? "border-red-500" : "border-gray-300";
  }

  function effacerErreur(nom: string) {
    setErrors((prev) => ({ ...prev, [nom]: "" }));
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      getCart(token).then((data) => setCart(data));
    }
  }, []);

  function validate() {
    const e: Record<string, string> = {};

    const estEmail = /^\S+@\S+\.\S+$/.test(contact.trim());
    const estTel = contact.replace(/\D/g, "").length >= 8;
    if (!estEmail && !estTel) {
      e.contact = "Entre un e-mail valide ou un numéro de portable.";
    }

    if (!firstName.trim()) e.firstName = "Le prénom est obligatoire.";
    if (!lastName.trim()) e.lastName = "Le nom est obligatoire.";

    if (!isLoggedIn) {
      const estEmail = /^\S+@\S+\.\S+$/.test(contact.trim());
      const estTel = contact.replace(/\D/g, "").length >= 8;
    if (!estEmail && !estTel) {
      e.contact = "Entre un e-mail valide ou un numéro de portable.";
      }
    }

    if (deliveryMode === "shipping") {
      if (!address.trim()) e.address = "L'adresse est obligatoire.";
      if (!city.trim()) e.city = "La ville est obligatoire.";
    }

    if (phone.replace(/\D/g, "").length < 8) {
      e.phone = "Entre un numéro de téléphone valide.";
    }

    if (paymentMethod !== "Airtel Money" && paymentMethod !== "moov money") {
      e.payment = "Choisis un mode de paiement.";
    }

    if (!cart || cart.cart.items.length === 0) {
      e.cart = "Ton panier est vide.";
    }

    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Fait défiler jusqu'à la première erreur
      setTimeout(() => {
        document
          .querySelector(".border-red-500")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  const shippingCost = 2000;
  const subtotal = cart?.total || 0;
  const total = subtotal + shippingCost;

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            {success ? (
              <p className="text-green-600 font-medium">
                Commande confirmée ! Tu vas être redirigé...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold  text-gray-900">Contact</h2>
                    <Link href="/connexion" className="text-blue-600 text-sm hover:underline">
                      Se connecter
                    </Link>
                  </div>
                  <input
                    type="text"
                    placeholder="E-mail ou numéro de portable"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      effacerErreur("contact");
                    }}
                    className={`border rounded-lg px-4 py-3 w-full text-gray-900 ${bordure("contact")}`}
                  />
                  <Erreur message={errors.contact} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900 mb-3">Livraison</h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("shipping")}
                      className={`flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium ${
                        deliveryMode === "shipping"
                          ? "border-gray-500 bg-gray-100 text-black"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <Truck size={16} />
                      Expédier
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("pickup")}
                      className={`flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium ${
                        deliveryMode === "pickup"
                          ? "border-gray-500 bg-gray-100 text-black"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <MapPin size={16} />
                      Retrait
                    </button>
                  </div>

                  {deliveryMode === "shipping" && (
                    <div className="flex flex-col gap-3">
                      <h2 className="font-bold text-gray-900 mb-3 mt-4">Coordonnées</h2>
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

                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" />
                        Sauvegarder mes coordonnées pour la prochaine fois
                      </label>
                    </div>
                  )}
                </div>

                {deliveryMode === "shipping" ? (
                  <div>
                    <h2 className="font-bold text-gray-900 mb-3">Mode d'expédition</h2>
                    <div className="border border-blue-600 bg-blue-50 rounded-lg flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-gray-900">Nouveau Tarif partout à Libreville</p>
                      <p className="text-sm text-gray-900">{shippingCost.toLocaleString()} F CFA</p>
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
                          NZENG-AYONG, Carrefour GP
                        </p>
                        <p className="text-green-600 text-sm font-medium">GRATUIT</p>
                      </div>
                      <p className="text-gray-400 text-xs">Habituellement prête en 1 heure</p>
                    </div>

                    <h2 className="font-bold text-gray-900 mb-3 mt-4">Coordonnées</h2>
                    <div className="grid grid-cols-2 gap-3 mb-3">
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
                  </div>
                )}

                <div>
                  <h2 className="font-bold text-gray-900 mb-1">Paiement</h2>
                  <p className="text-gray-500 text-sm mb-3">
                    Toutes les transactions sont sécurisées et chiffrées.
                  </p>
                  <div className={`border rounded-lg overflow-hidden ${bordure("payment")}`}>
                    <label
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-300 ${
                        paymentMethod === "Airtel Money" ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "Airtel Money"}
                        onChange={() => {
                          setPaymentMethod("Airtel Money");
                          effacerErreur("payment");
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900">Paiement via Airtel Money</span>
                    </label>
                    {paymentMethod === "Airtel Money" && (
                      <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        Paiement obligatoire pour confirmer votre commande. Vous recevrez un lien de paiement sécurisé directement par WhatsApp.
                      </div>
                    )}

                    <label
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                        paymentMethod === "moov money" ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "moov money"}
                        onChange={() => {
                          setPaymentMethod("moov money");
                          effacerErreur("payment");
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900">Paiement via Moov Money</span>
                    </label>

                    {paymentMethod === "moov money" && (
                      <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        Paiement obligatoire pour confirmer votre commande. Vous recevrez un lien de paiement sécurisé directement par WhatsApp.
                      </div>
                    )}
                  </div>
                  <Erreur message={errors.payment} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentInfo(true)}
                  className="text-pink-400 text-sm hover:underline text-left"
                >
                  Mode d'emploi du paiement
                </button>

                <div>
                  <Erreur message={errors.cart} />
                  <button
                    type="submit"
                    className="bg-black text-white rounded-lg py-3 w-full font-medium hover hover:bg-blue-400"
                  >
                    Valider le paiement
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="md:col-span-2 bg-gray-50 rounded-xl p-6 h-fit">
            {cart && cart.cart.items.length > 0 ? (
              <>

                {cart.cart.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {getCategoryImage(item.product.category?.name) ? (
                        <Image
                          src={getCategoryImage(item.product.category?.name)!}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                      <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                    </div>
                    <p className="text-gray-900 text-sm">
                      {item.product.price * item.quantity} F CFA
                    </p>
                  </div>
                ))}

                <div className="flex gap-2 mb-6 mt-4">
                  <input
                    type="text"
                    placeholder="Code de réduction ou carte-cadeau"
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 text-gray-900"
                  />
                  <button className="bg-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg">
                    Valider
                  </button>
                </div>

                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <p>Sous-total</p>
                  <p>{subtotal.toLocaleString()} F CFA</p>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mb-4">
                  <p>Expédition</p>
                  <p>{shippingCost.toLocaleString()} F CFA</p>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-300 pt-4">
                  <p>Total</p>
                  <p>
                    <span className="text-xs text-gray-500 mr-1">XOF</span>
                    {total.toLocaleString()} F CFA
                  </p>
                </div>
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
              <h3 className="font-bold text-gray-900">Mode d'emploi du paiement</h3>
              <button onClick={() => setShowPaymentInfo(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pour confirmer votre commande, un acompte correspondant à la moitié du montant total est demandé. Une fois votre commande validée, nous vous enverrons un lien de paiement sécurisé directement par WhatsApp. Le solde restant sera à régler à la livraison.
            </p>
          </div>
        </div>
      )}

      {isLoggedIn === false && (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-bold  text-gray-900">Contact</h2>
      <Link href="/connexion" className="text-blue-600 text-sm hover:underline">
        Se connecter
      </Link>
    </div>
    <input
      type="text"
      placeholder="E-mail ou numéro de portable"
      value={contact}
      onChange={(e) => {
        setContact(e.target.value);
        effacerErreur("contact");
      }}
      className={`border rounded-lg px-4 py-3 w-full text-gray-900 ${bordure("contact")}`}
    />
    <Erreur message={errors.contact} />
  </div>
)}

      <Footer />
    </>
  );
}