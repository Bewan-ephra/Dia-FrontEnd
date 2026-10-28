"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { registerUser, syncLocalFavorites } from "@/lib/api";

export default function InscriptionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await registerUser(name, email, password, passwordConfirmation);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        await syncLocalFavorites();
        setDone(true);
      } else {
        const first = data.errors ? (Object.values(data.errors).flat()[0] as string) : null;
        setError(first ?? data.message ?? "Erreur lors de l'inscription. Vérifie tes informations.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {done ? (
          <div className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm text-center">
            <h1 className="text-2xl font-bold text-gray-900">Compte créé !</h1>
            <p className="text-gray-600 text-sm">
              Un e-mail de confirmation vient de t&apos;être envoyé. Clique sur le lien qu&apos;il
              contient pour pouvoir passer commande.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white rounded px-4 py-2"
            >
              Découvrir la boutique
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm"
          >
            <h1 className="text-2xl font-bold text-gray-900">Inscription</h1>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border rounded px-4 py-2 text-gray-900"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded px-4 py-2 text-gray-900"
            />
            <input
              type="password"
              placeholder="Mot de passe (8 caractères minimum)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded px-4 py-2 text-gray-900"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="border rounded px-4 py-2 text-gray-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {isLoading ? "Création..." : "S'inscrire"}
            </button>
            <p className="text-sm text-gray-600 text-center">
              Déjà un compte ?{" "}
              <Link href="/connexion" className="text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        )}
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}