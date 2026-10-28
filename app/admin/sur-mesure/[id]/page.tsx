"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminCustomRequest,
  quoteCustomRequest,
  rejectCustomRequest,
  CustomRequest,
} from "@/lib/api/custom-requests";
import { getCustomStatusColor, getCustomStatusLabel, effectiveStatus } from "@/lib/custom-request-status";
import { formatPrice, formatDate } from "@/lib/format";

export default function AdminCustomRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [price, setPrice] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [note, setNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [validDays, setValidDays] = useState("7");

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        const data = await getAdminCustomRequest(Number(id));
        setRequest(data);
        if (data.quoted_price) setPrice(String(Number(data.quoted_price)));
        if (data.lead_time_days) setLeadTime(String(data.lead_time_days));
        if (data.status === "devis_envoye" && data.admin_note) setNote(data.admin_note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement de la demande");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params]);

  async function handleQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      setRequest(
        await quoteCustomRequest(request.id, {
          quoted_price: Number(price),
          lead_time_days: leadTime ? Number(leadTime) : null,
          admin_note: note.trim() || null,
          valid_days: validDays ? Number(validDays) : null,
        })
      );
      setSuccess("Devis envoyé au client.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du devis");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReject() {
    if (!request) return;
    if (!rejectNote.trim()) {
      setError("Indiquez la raison du refus : elle sera visible par le client.");
      return;
    }
    if (!window.confirm("Refuser cette demande ?")) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      setRequest(await rejectCustomRequest(request.id, rejectNote.trim()));
      setSuccess("Demande refusée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du refus");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div>Chargement...</div>;

  if (!request) {
    return (
      <div>
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">{error}</div>
        )}
        <Link href="/admin/sur-mesure" className="text-blue-600">← Retour aux demandes</Link>
      </div>
    );
  }

  const open = request.status === "en_attente" || request.status === "devis_envoye";
  const status = effectiveStatus(request);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">
          Demande #{request.id} · {request.title}
        </h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCustomStatusColor(status)}`}>
          {getCustomStatusLabel(status)}
        </span>
      </div>

      {request.valid_until && request.status === "devis_envoye" && (
        <p className="text-sm text-gray-500 mb-2">
          {request.is_expired ? "Devis expiré le " : "Devis valable jusqu'au "}
          {formatDate(request.valid_until)}
        </p>
      )}

      {request.user && (
        <Link
          href={`/admin/messages/${request.user.id}?demande=${request.id}`}
          className="inline-block mb-6 text-blue-600 text-sm"
        >
          Écrire au client à propos de cette demande
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6 max-w-2xl">
        <div>
          <p className="text-gray-500">Client</p>
          <p className="font-medium">{request.user?.name ?? "Compte supprimé"}</p>
        </div>
        <div>
          <p className="text-gray-500">Contact</p>
          <p className="font-medium">{request.user?.email}</p>
          <p className="font-medium">{request.user?.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Envoyée le</p>
          <p className="font-medium">{formatDate(request.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500">Quantité</p>
          <p className="font-medium">{request.quantity}</p>
        </div>
        {request.product && (
          <div>
            <p className="text-gray-500">Modèle de départ</p>
            <p className="font-medium">{request.product.name}</p>
          </div>
        )}
        {request.color && (
          <div>
            <p className="text-gray-500">Couleur</p>
            <p className="font-medium">{request.color}</p>
          </div>
        )}
        {request.size_info && (
          <div>
            <p className="text-gray-500">Taille / mesures</p>
            <p className="font-medium">{request.size_info}</p>
          </div>
        )}
        {request.desired_date && (
          <div>
            <p className="text-gray-500">Date souhaitée</p>
            <p className="font-medium">{formatDate(request.desired_date)}</p>
          </div>
        )}
        <div className="sm:col-span-2">
          <p className="text-gray-500">Description</p>
          <p className="font-medium whitespace-pre-line">{request.description}</p>
        </div>
      </div>

      {request.images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {request.images.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-32 h-32 object-cover rounded-lg border" />
            </a>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4 max-w-md">{error}</div>
      )}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {request.status === "acceptee" && request.order_id && (
        <p className="mb-4">
          Devis accepté ({request.quoted_price ? formatPrice(request.quoted_price) : "—"}).{" "}
          <Link href={`/admin/commandes/${request.order_id}`} className="text-blue-600">
            Voir la commande #{request.order_id}
          </Link>
        </p>
      )}

      {request.status === "rejetee" && request.admin_note && (
        <p className="mb-4 text-sm">
          Raison du refus : <span className="font-medium">{request.admin_note}</span>
        </p>
      )}

      {open && (
        <>
          <form onSubmit={handleQuote} className="flex flex-col gap-4 max-w-md mb-8">
            <h2 className="text-xl font-bold">
              {request.status === "devis_envoye"
                ? request.is_expired
                  ? "Renvoyer le devis"
                  : "Modifier le devis"
                : "Envoyer un devis"}
            </h2>
            <input
              type="number" min={1} step="1" required placeholder="Prix total (FCFA)" value={price}
              onChange={(e) => setPrice(e.target.value)} className="border rounded px-4 py-2"
            />
            <input
              type="number" min={1} placeholder="Délai de confection (jours)" value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)} className="border rounded px-4 py-2"
            />
            <input
              type="number" min={1} max={90} placeholder="Validité du devis (jours)" value={validDays}
              onChange={(e) => setValidDays(e.target.value)} className="border rounded px-4 py-2"
            />
            <textarea
              rows={3} maxLength={1000} placeholder="Message pour le client (facultatif)" value={note}
              onChange={(e) => setNote(e.target.value)} className="border rounded px-4 py-2"
            />
            <button
              type="submit" disabled={isSaving}
              className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {isSaving ? "Envoi..." : "Envoyer le devis"}
            </button>
            <p className="text-gray-500 text-xs">
              Le prix est le total pour toute la demande (quantité comprise), hors livraison. Le
              client peut l&apos;accepter tant que vous ne le modifiez pas et que sa validité n&apos;est
              pas dépassée.
            </p>
          </form>

          <div className="flex flex-col gap-3 max-w-md border-t pt-6">
            <h2 className="text-xl font-bold">Refuser la demande</h2>
            <textarea
              rows={2} maxLength={1000} placeholder="Raison (visible par le client)" value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)} className="border rounded px-4 py-2"
            />
            <button
              type="button" onClick={handleReject} disabled={isSaving}
              className="border border-red-600 text-red-600 rounded px-4 py-2 disabled:opacity-50"
            >
              Refuser
            </button>
          </div>
        </>
      )}
    </div>
  );
}