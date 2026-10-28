"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ChatThread from "@/components/ChatThread";
import { getAdminConversation, replyToClient, ChatContext } from "@/lib/api/inbox";

function Content({ userId }: { userId: number }) {
  const params = useSearchParams();
  const [client, setClient] = useState<{ id: number; name: string; email: string; phone: string | null } | null>(
    null
  );

  const initialContext: ChatContext = {
    order_id: Number(params.get("commande")) || undefined,
    custom_request_id: Number(params.get("demande")) || undefined,
  };

  const load = useCallback(async () => {
    const res = await getAdminConversation(userId);
    setClient(res.user);
    return res.messages;
  }, [userId]);

  const send = useCallback(
    (body: string, ctx: ChatContext) => replyToClient(userId, body, ctx),
    [userId]
  );

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/messages" className="text-blue-600 text-sm">
          ← Toutes les conversations
        </Link>
        {client && (
          <div className="mt-2">
            <h1 className="text-lg font-semibold text-gray-900">{client.name}</h1>
            <p className="text-gray-500 text-sm">
              {client.email}
              {client.phone ? ` · ${client.phone}` : ""} ·{" "}
              <Link href={`/admin/clients/${client.id}`} className="text-blue-600">
                Fiche client
              </Link>
            </p>
          </div>
        )}
      </div>

      <ChatThread
        load={load}
        send={send}
        viewerIsAdmin
        initialContext={initialContext}
        emptyText="Aucun message : écrivez le premier."
      />
    </>
  );
}

export default function AdminConversationPage({ params }: { params: Promise<{ userId: string }> }) {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    params.then((p) => setUserId(Number(p.userId)));
  }, [params]);

  if (!userId) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="max-w-3xl">
      <Suspense fallback={<p className="text-gray-500">Chargement...</p>}>
        <Content userId={userId} />
      </Suspense>
    </div>
  );
}