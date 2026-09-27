"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { getCategoriesPublic } from "@/lib/api";

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getCategoriesPublic().then((data) => setCategories(data));
  }, []);


  return (
    
    <footer className=" bg-black text-gray-300 mt-16 relative">
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <p className="text-white text-2xl font-bold mb-3">DIA</p>
          <p className="text-sm text-gray-50 mb-4">
            Des produits stylés, livrés chez vous partout dans dans le grand Librevile.
          </p>
          <p className="text-sm text-orange-400  mb-4">
            Qu' attendez-vous !
          </p>
          <div className="flex gap-3 mb-4">
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
              <FaInstagram size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
              <FaTiktok size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
              <FaWhatsapp size={16} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-white font-medium mb-3">Catégories</p>
          <ul className="flex flex-col gap-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/produits?category_id=${category.id}`} className="hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-white font-medium mb-3">Mon compte</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/connexion" className="hover:text-white">Connexion</Link></li>
            <li><Link href="/profil" className="hover:text-white">Mon profil</Link></li>
            <li><Link href="/commandes" className="hover:text-white">Mes commandes</Link></li>
            <li><Link href="/favoris" className="hover:text-white">Favoris</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-medium mb-3">Contact</p>
          <p className="text-sm text-gray-400 mb-1">contact@dia.com</p>
          <p className="text-sm text-gray-400">Libreville, GABON</p>
          <p className="text-sm text-gray-400 mt-4">Site 100% en ligne</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-4 border-t border-gray-800 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-400 mr-2">PAIEMENT</p>
        <span className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded">Airtel Money</span>
        <span className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded">Moov Money</span>
        <span className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded">Paiement à la livraison</span>
      </div>

      <div className="border-t border-gray-800 max-w-6xl mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
        <p>© 2026 DIA. Tous droits réservés.</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-white">Conditions générales</Link>
          <Link href="#" className="hover:text-white">Politique de retour</Link>
        </div>
      </div>

    </footer>
  );
}