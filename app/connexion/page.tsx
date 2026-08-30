"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { loginUser } from "@/lib/api";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const data = await loginUser(email, password);

    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/");
    } else {
      setError("Email ou mot de passe incorrect.");
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

          {error && <p className="text-red-600">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-4 py-2 text-gray-900"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-4 py-2 text-gray-900"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            Se connecter
          </button>
        </form>
      </div>
    </>
  );
}