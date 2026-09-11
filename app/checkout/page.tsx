"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Validation de la commande
        </h1>

        {success ? (
          <p className="text-green-600 font-medium">
            Commande confirmée ! Tu vas être redirigé...
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-4 py-2 text-gray-900"
            />
            <input
              type="text"
              placeholder="Adresse de livraison"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded px-4 py-2 text-gray-900"
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded px-4 py-2 text-gray-900"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium"
            >
              Confirmer la commande
            </button>
          </form>
        )}
      </div>
      </div>
    </>
  );
}