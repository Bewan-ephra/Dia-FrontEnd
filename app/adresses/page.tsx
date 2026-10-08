"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getAddresses, addAddress, removeAddress } from "@/lib/api";
import { Home, Briefcase, MapPin, Phone, Plus, Trash2, X } from "lucide-react";

const labelOptions = ["Maison", "Bureau", "Autre"];

function getLabelIcon(label: string) {
  if (label === "Maison") return Home;
  if (label === "Bureau") return Briefcase;
  return MapPin;
}

export default function AdressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState("Maison");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setAddresses(getAddresses());
  }, []);

  function resetForm() {
    setLabel("Maison");
    setStreet("");
    setCity("");
    setPhone("");
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!street.trim() || !city.trim()) return;
    const updated = addAddress({ label, street, city, phone });
    setAddresses(updated);
    closeModal();
  }

  function handleRemove(id: number) {
    const updated = removeAddress(id);
    setAddresses(updated);
  }

  const canSubmit = street.trim() !== "" && city.trim() !== "";

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mes adresses
              </h1>
              <p className="text-gray-500 text-sm">
                Enregistrez vos adresses pour commander plus rapidement.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-orange-400 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex-shrink-0 transition"
            >
              <Plus size={16} />
              Ajouter une adresse
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">
                Aucune adresse enregistrée
              </p>
              <p className="text-gray-500 text-sm">
                Ajoutez votre première adresse de livraison.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => {
                const Icon = getLabelIcon(address.label);
                return (
                  <div
                    key={address.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-orange-300 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-50 text-orange-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon size={18} />
                        </div>
                        <p className="font-bold text-gray-900">
                          {address.label}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(address.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        aria-label="Supprimer l'adresse"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-gray-700 text-sm">{address.street}</p>
                    <p className="text-gray-500 text-sm mb-2">{address.city}</p>

                    {address.phone && (
                      <p className="flex items-center gap-2 text-gray-500 text-sm">
                        <Phone size={14} />
                        {address.phone}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Ajouter une adresse</h2>
              <button onClick={closeModal}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Type</p>
                <div className="flex gap-2">
                  {labelOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLabel(option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                        label === option
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Rue / quartier"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
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
                placeholder="Téléphone (facultatif)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              />

              <button
                type="submit"
                disabled={!canSubmit}
                className="bg-gray-900 hover:bg-orange-400 text-white rounded-lg py-3 font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Enregistrer l'adresse
              </button>
            </form>
          </div>
        </div>
      )}

      <ScrollToTop />
      <Footer />
    </>
  );
}