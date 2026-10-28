"use client";
import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ChatThread from "@/components/ChatThread";
import { getMyMessages, sendMessage, ChatContext } from "@/lib/api/inbox";

function MessagesContent() {
  const router = useRouter();
  const params = useSearchParams();

  const initialContext: ChatContext = {
    order_id: Number(params.get("commande")) || undefined,
    custom_request_id: Number(params.get("demande")) || undefined,
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/connexion");
  }, [router]);

  const load = useCallback(async () => (await getMyMessages()).messages, []);
  const send = useCallback((body: string, ctx: ChatContext) => sendMessage(body, ctx), []);

  return (
    <ChatThread
      load={load}
      send={send}
      viewerIsAdmin={false}
      initialContext={initialContext}
      emptyText="Posez votre question à la boutique : nous vous répondons ici."
    />
  );
}

export default function MessagesPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-500 text-sm mb-6">
            Échangez avec la boutique à propos de vos commandes et de vos demandes sur mesure.
          </p>
          <Suspense fallback={<p className="text-gray-500 text-sm">Chargement...</p>}>
            <MessagesContent />
          </Suspense>
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}