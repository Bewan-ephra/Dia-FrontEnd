"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getAddresses, addAddress, removeAddress } from "@/lib/api";

export default function AdressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    setAddresses(getAddresses());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated = addAddress({ label, street, city });
    setAddresses(updated);
    setLabel("");
    setStreet("");
    setCity("");
  }

  function handleRemove(id: number) {
    const updated = removeAddress(id);
    setAddresses(updated);
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Mes adresses
          </h1>

          <div className="flex flex-col gap-4 mb-8">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {address.label}
                  </p>
                  <p className="text-gray-500">
                    {address.street}, {address.city}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(address.id)}
                  className="text-red-600"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="font-medium text-gray-900">
              Ajouter une adresse
            </h2>
            
            <input
              type="text"
              placeholder="Adresse (ex: Quartier, Bureau)"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="border rounded px-4 py-2 text-gray-900"
            />
            <input
              type="text"
              placeholder="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border rounded px-4 py-2 text-gray-900"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium"
            >
              Ajouter
            </button>
          </form>
        </div>
      </div>
    </>
  );
}