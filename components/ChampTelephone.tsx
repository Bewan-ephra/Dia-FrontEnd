"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ChampTelephone({ value, onChange }: Props) {
  const [afficher, setAfficher] = useState(false);

  return (
    <div className="relative">
      <input
        type="tel"
        placeholder="Téléphone"
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900 w-full"
      />

      {/* Conteneur de l'icône : sert de repère pour centrer la bulle */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <button
          type="button"
          aria-label="Pourquoi demande-t-on votre téléphone ?"
          onMouseEnter={() => setAfficher(true)}
          onMouseLeave={() => setAfficher(false)}
          onClick={() => setAfficher(true)}
          onBlur={() => setAfficher(false)}
          className="block text-gray-700"
        >
          <HelpCircle size={20} />
        </button>

        {afficher && (
          <div className="absolute bottom-full mb-3 w-52 -right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 rounded-lg bg-[#2d2d2d] px-3.5 py-3 text-center text-sm leading-snug text-white z-10">
            Au cas où nous aurions besoin de vous contacter à propos de votre commande
            <span className="absolute top-full right-3.5 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 border-8 border-transparent border-t-[#2d2d2d]" />
          </div>
        )}
      </div>
    </div>
  );
}