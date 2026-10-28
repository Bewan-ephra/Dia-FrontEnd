"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loginUser, syncLocalFavorites } from "@/lib/api";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        await syncLocalFavorites();
        router.push("/");
      } else {
        setError(data.errors?.email?.[0] ?? data.message ?? "Email ou mot de passe incorrect.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Réessaie dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>

          {error && <p className="text-red-600 text-sm">{error}</p>}

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
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border rounded px-4 py-2 text-gray-900"
          />

          <Link
            href="/mot-de-passe-oublie"
            className="text-sm text-blue-600 hover:underline -mt-2 self-end"
          >
            Mot de passe oublié ?
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-blue-600 hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
}