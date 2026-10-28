"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { forgotPassword } from "@/lib/api";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer l'e-mail pour le moment."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        {sent ? (
          <div className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm text-center">
            <h1 className="text-2xl font-bold text-gray-900">Vérifie ta boîte mail</h1>
            <p className="text-gray-600 text-sm">
              Si un compte existe pour <span className="font-medium">{email}</span>, un e-mail
              contenant un lien de réinitialisation vient d&apos;être envoyé. Le lien est valable
              une heure.
            </p>
            <Link href="/connexion" className="text-blue-600 text-sm hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm"
          >
            <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
            <p className="text-gray-600 text-sm">
              Entre l&apos;adresse e-mail de ton compte : nous t&apos;enverrons un lien pour choisir
              un nouveau mot de passe.
            </p>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded px-4 py-2 text-gray-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {isLoading ? "Envoi..." : "Envoyer le lien"}
            </button>
            <Link href="/connexion" className="text-sm text-blue-600 text-center hover:underline">
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}