"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { verifyEmail } from "@/lib/api";

function VerifyContent() {
  const { id, hash } = useParams<{ id: string; hash: string }>();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyEmail(id, hash, searchParams.toString())
      .then(() => setState("ok"))
      .catch((err: Error) => {
        setMessage(err.message || "Lien invalide ou expiré.");
        setState("error");
      });
  }, [id, hash, searchParams]);

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
      {state === "loading" && <p className="text-gray-600">Vérification en cours...</p>}
      {state === "ok" && (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Adresse e-mail confirmée</h1>
          <p className="text-gray-600 text-sm mb-4">Tu peux maintenant passer commande.</p>
          <Link href="/produits" className="inline-block bg-black text-white rounded-lg px-5 py-2.5 text-sm">
            Voir le catalogue
          </Link>
        </>
      )}
      {state === "error" && (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
          <p className="text-red-600 text-sm mb-4">{message}</p>
          <p className="text-gray-600 text-sm">
            Reconnecte-toi, puis demande un nouvel e-mail depuis la page de commande.
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Suspense fallback={<p className="text-gray-600">Chargement...</p>}>
          <VerifyContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}