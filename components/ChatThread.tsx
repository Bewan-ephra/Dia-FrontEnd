"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, X } from "lucide-react";
import type { ChatContext, ChatMessage } from "@/lib/api/inbox";
import { formatDateTime } from "@/lib/format";

interface Props {
  load: () => Promise<ChatMessage[]>;
  send: (body: string, context: ChatContext) => Promise<ChatMessage>;
  viewerIsAdmin: boolean;
  initialContext?: ChatContext;
  emptyText?: string;
}

export default function ChatThread({ load, send, viewerIsAdmin, initialContext, emptyText }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState<ChatContext>(initialContext ?? {});
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const orderHref = (id: number) => (viewerIsAdmin ? `/admin/commandes/${id}` : `/commandes/${id}`);
  const requestHref = (id: number) => (viewerIsAdmin ? `/admin/sur-mesure/${id}` : `/mes-demandes/${id}`);

  const refresh = useCallback(async () => {
    try {
      setMessages(await load());
      setError(null);
      // Ouvrir la conversation marque les messages comme lus : on actualise les compteurs
      window.dispatchEvent(new Event("inbox:updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les messages.");
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 10000);
    return () => clearInterval(timer);
  }, [refresh]);

  // On descend en bas de la conversation seulement quand un message arrive
  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      const box = listRef.current;
      if (box) box.scrollTop = box.scrollHeight;
    }
  }, [messages.length]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const sent = await send(body, context);
      setMessages((prev) => [...prev, sent]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div ref={listRef} className="h-[55vh] overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Chargement...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center my-auto">
            {emptyText ?? "Aucun message pour le moment."}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.from_admin === viewerIsAdmin;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    mine ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  {(m.order_id || m.custom_request_id) && (
                    <div className="mb-1 flex gap-2 text-xs">
                      {m.order_id && (
                        <Link
                          href={orderHref(m.order_id)}
                          className={`underline ${mine ? "text-pink-300" : "text-blue-600"}`}
                        >
                          Commande #{m.order_id}
                        </Link>
                      )}
                      {m.custom_request_id && (
                        <Link
                          href={requestHref(m.custom_request_id)}
                          className={`underline ${mine ? "text-pink-300" : "text-blue-600"}`}
                        >
                          Demande sur mesure #{m.custom_request_id}
                        </Link>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-line break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-gray-400" : "text-gray-500"}`}>
                    {formatDateTime(m.created_at)}
                    {mine && m.read ? " · Lu" : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200 p-3">
        {(context.order_id || context.custom_request_id) && (
          <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-800 rounded-lg px-3 py-2 mb-2">
            <span>
              À propos{" "}
              {context.order_id
                ? `de la commande #${context.order_id}`
                : `de la demande sur mesure #${context.custom_request_id}`}
            </span>
            <button type="button" onClick={() => setContext({})} aria-label="Retirer le contexte">
              <X size={14} />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-2 mb-2 text-xs">{error}</div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Entrée envoie, Maj+Entrée va à la ligne
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Écrire un message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !draft.trim()}
            aria-label="Envoyer"
            className="bg-black text-white rounded-lg p-3 hover:bg-blue-400 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}