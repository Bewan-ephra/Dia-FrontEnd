"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getCart, getCategoryImage } from "@/lib/api";
import { Truck, MapPin, X, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [deliveryMode, setDeliveryMode] = useState<"shipping" | "pickup">("shipping");
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCart(token).then((data) => setCart(data));
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
                    className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900"
                  />
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
                        <input
                          type="text"
                          placeholder="Prénom"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Adresse"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      />
                      <input
                        type="text"
                        placeholder="Ville"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      />
                      <input
                        type="tel"
                        placeholder="Téléphone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      />
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
      <input
        type="text"
        placeholder="Prénom"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
      />
      <input
        type="text"
        placeholder="Nom"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
      />
    </div>
    <input
      type="tel"
      placeholder="Téléphone"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 w-full"
    />
  </div>
)}


                <div>
                  <h2 className="font-bold text-gray-900 mb-1">Paiement</h2>
                  <p className="text-gray-500 text-sm mb-3">
                    Toutes les transactions sont sécurisées et chiffrées.
                  </p>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <label
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-300 ${
                        paymentMethod === "Airtel Money" ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "Airtel Money"}
                        onChange={() => setPaymentMethod("Airtel Money")}
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
                        onChange={() => setPaymentMethod("moov money")}
                      />
                      <span className="text-sm font-medium text-gray-900">Paiement via Moov Money</span>
                    </label>
                    {paymentMethod === "moov money" && (
                      <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        Paiement obligatoire pour confirmer votre commande. Vous recevrez un lien de paiement sécurisé directement par WhatsApp.
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentInfo(true)}
                  className="text-orange-400 text-sm hover:underline text-left"
                >
                  Mode d'emploi du paiement
                </button>

                <button
                  type="submit"
                  className="bg-black text-white rounded-lg py-3 font-medium hover hover:bg-orange-400"
                >
                  Valider le paiement
                </button>
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

      <Footer />
    </>
  );
}