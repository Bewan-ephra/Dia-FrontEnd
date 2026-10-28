"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Scissors } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getMyCustomRequests, CustomRequest } from "@/lib/api/custom-requests";
import { getCustomStatusColor, getCustomStatusLabel, effectiveStatus } from "@/lib/custom-request-status";
import { formatPrice, formatDate } from "@/lib/format";

export default function MesDemandesPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/connexion";
      return;
    }
    getMyCustomRequests(1)
      .then((res) => {
        setRequests(res.data);
        setLastPage(res.meta.last_page);
      })
      .catch((err: Error) => setError(err.message || "Impossible de charger vos demandes."))
      .finally(() => setIsLoading(false));
  }, []);

  async function loadMore() {
    const next = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await getMyCustomRequests(next);
      setRequests((prev) => [...prev, ...res.data]);
      setPage(next);
      setLastPage(res.meta.last_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la suite.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes demandes sur mesure</h1>
              <p className="text-gray-500 text-sm">Suivez vos devis de personnalisation.</p>
            </div>
            <Link
              href="/sur-commande#formulaire"
              className="bg-gray-900 hover:bg-blue-400 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex-shrink-0"
            >
              Nouvelle demande
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-6 text-sm">{error}</div>
          )}

          {isLoading ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">Aucune demande pour le moment</p>
              <p className="text-gray-500 text-sm">Décrivez votre idée pour recevoir un devis.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((r) => (
                <Link
                  key={r.id}
                  href={`/mes-demandes/${r.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{r.title}</p>
                      <p className="text-gray-500 text-sm">
                        Demande #{r.id} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCustomStatusColor(effectiveStatus(r))}`}>
                      {getCustomStatusLabel(effectiveStatus(r))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-700">
                      {r.quoted_price
                        ? <>Devis : <span className="font-bold">{formatPrice(r.quoted_price)}</span></>
                        : <span className="text-gray-500">Devis en préparation</span>}
                    </p>
                    <span className="flex items-center gap-1 text-pink-500 text-sm font-medium">
                      Voir le détail <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}

              {page < lastPage && (
                <button
                  onClick={loadMore} disabled={isLoadingMore}
                  className="border border-black text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 self-center"
                >
                  {isLoadingMore ? "Chargement..." : "Voir plus"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}