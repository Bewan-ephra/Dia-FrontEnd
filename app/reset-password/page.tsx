"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { resetPassword } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, email, password, passwordConfirmation: confirmation });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de réinitialiser le mot de passe.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900">Lien invalide</h1>
        <p className="text-gray-600 text-sm">
          Ce lien de réinitialisation est incomplet. Demande-en un nouveau.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900">Mot de passe modifié</h1>
        <p className="text-gray-600 text-sm">
          Tu peux maintenant te connecter avec ton nouveau mot de passe. Par sécurité, tu as été
          déconnecté de tes autres appareils.
        </p>
        <Link href="/connexion" className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm"
    >
      <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
      <p className="text-gray-600 text-sm">
        Compte : <span className="font-medium">{email}</span>
      </p>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="password"
        placeholder="Nouveau mot de passe (8 caractères minimum)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border rounded px-4 py-2 text-gray-900"
      />
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        required
        className="border rounded px-4 py-2 text-gray-900"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isLoading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Suspense fallback={<p className="text-gray-600">Chargement...</p>}>
          <ResetForm />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}