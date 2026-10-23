"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Star, ArrowLeft } from "lucide-react";

type Review = { rating: number; content: string; title: string };

type Props = {
  open: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string | null;
  onNext?: (review: Review) => void;
};

type StarsProps = {
  active: number;
  onHover: (n: number) => void;
  onSelect: (n: number) => void;
};

function Stars({ active, onHover, onSelect }: StarsProps) {
  return (
    <div className="w-fit mx-auto">
      <div className="flex gap-2" onMouseLeave={() => onHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            onMouseEnter={() => onHover(n)}
            onClick={() => onSelect(n)}
          >
            <Star
              size={44}
              strokeWidth={1.5}
              className={`text-pink-400 transition ${
                n <= active ? "fill-pink-400" : "fill-transparent"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-gray-900 mt-1">
        <span className="w-11 flex justify-center whitespace-nowrap">Mauvais</span>
        <span className="w-11 flex justify-center whitespace-nowrap">Excellent</span>
      </div>
    </div>
  );
}

export default function ReviewModal({
  open,
  onClose,
  productName,
  productImage,
  onNext,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);

  // Remet tout à zéro à chaque ouverture
  useEffect(() => {
    if (open) {
      setStep(1);
      setHover(0);
      setRating(0);
      setContent("");
      setTitle("");
      setError(false);
    }
  }, [open]);

  // Ferme avec la touche Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const active = hover || rating;

  function choisirEtoile(n: number) {
    setRating(n);
    // Petit délai pour voir l'étoile se remplir avant le défilement
    setTimeout(() => setStep(2), 250);
  }

  function handleNext() {
    if (!content.trim()) {
      setError(true);
      return;
    }
    onNext?.({ rating, content: content.trim(), title: title.trim() });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto px-6 sm:px-12 py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 text-gray-900 hover hover:text-blue-300 z-10"
        >
          <X size={24} />
        </button>

        {/* Fenêtre visible : cache le panneau qui est hors champ */}
        <div className="overflow-hidden">
          {/* Rail qui glisse : 1 panneau = 100 % de la largeur */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: step === 1 ? "translateX(0)" : "translateX(-100%)" }}
          >
            {/* Panneau 1 : évaluation */}
            <div className="w-full shrink-0 flex flex-col justify-center text-center">
              <fieldset disabled={step !== 1} className="min-w-0 border-0 p-0 m-0">
                <h3 className="text-xl text-gray-900 mb-2 mt-2">
                  Comment évalueriez-vous ce produit ?
                </h3>
                <p className="text-sm text-gray-700 mb-8">
                  Nous serions ravis que vous partagiez un peu votre expérience.
                </p>

                <div className="relative w-40 h-40 mx-auto rounded-xl overflow-hidden bg-gray-100 mb-6">
                  {productImage ? (
                    <Image src={productImage} alt={productName} fill className="object-cover" />
                  ) : null}
                </div>

                <p className="font-bold text-gray-900 mb-6">{productName}</p>

                <Stars active={active} onHover={setHover} onSelect={choisirEtoile} />
              </fieldset>
            </div>

            {/* Panneau 2 : formulaire */}
            <div className="w-full shrink-0 flex flex-col justify-center">
              <fieldset disabled={step !== 2} className="min-w-0 border-0 p-0 m-0">
                <h3 className="font-bold text-gray-900 text-lg text-center mb-4 mt-2">
                  {productName}
                </h3>

                <Stars active={active} onHover={setHover} onSelect={setRating} />

                <label className="block text-gray-900 mt-8 mb-2">
                  Contenu de l'avis (Obligatoire)
                </label>
                <textarea
                  rows={5}
                  placeholder="Commencez à écrire ici..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setError(false);
                  }}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-500"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">
                    Veuillez écrire votre avis pour continuer.
                  </p>
                )}

                <label className="block text-gray-900 mt-6 mb-2">Titre de l'avis</label>
                <input
                  type="text"
                  placeholder="Donnez un titre à votre avis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-500"
                />

                <p className="text-xs text-gray-600 text-center mt-8 mb-6 leading-relaxed">
                  Nous vous contacterons uniquement au sujet de votre avis si nécessaire.
                  En soumettant votre avis, vous acceptez nos{" "}
                  <a href="#" className="underline">conditions d'utilisation</a> et notre{" "}
                  <a href="#" className="underline">politique de confidentialité</a>.
                </p>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-gray-900 px-2 py-2"
                  >
                    <ArrowLeft size={18} />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-10 py-3"
                  >
                    Suivant
                  </button>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}