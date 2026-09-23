"use client";

import { getCategoriesPublic } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, Heart, Search } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    getCategoriesPublic().then((data) => setCategories(data));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/produits?search=${encodeURIComponent(search)}`);
    }
  }

  return (
    <>
      <div className="bg-amber-100 text-center py-2 text-sm text-amber-800 font-medium">
         ARTICLE ÉGALEMENT SUR COMMANDE🎁 
      </div>
   
    <nav className="bg-white shadow-md relative">
      
      <div className="flex items-center justify-between px-4 md:px-8 py-4 gap-3">
  <Link href="/" className="text-xl font-bold text-gray-800 flex-shrink-0">
    DIA
  </Link>

  <form
    onSubmit={handleSearch}
    className="flex items-center relative flex-1 max-w-xl"
  >
    <Search size={16} className="absolute left-3 text-gray-400" />
    <input
      type="text"
      placeholder="Rechercher..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-lg pl-9 pr-4 py-2 text-sm w-full"
    />
  </form>

  <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
    <Link href="/favoris" className="text-gray-600 hover:text-blue-600">
      <Heart size={20} />
    </Link>
    <Link href="/panier" className="text-gray-600 hover:text-blue-600">
      <ShoppingCart size={20} />
    </Link>
    <Link href="/profil" className="text-gray-600 hover:text-blue-600">
      <User size={20} />
    </Link>
    <button
      className="md:hidden text-2xl"
      onClick={() => setIsOpen(!isOpen)}
    >
      <Menu size={22} />
    </button>
  </div>
</div>

      {/* Ligne 2 : liens de navigation */}
      <ul
       className={`${
       isOpen ? "flex" : "hidden"
       } md:flex flex-col md:flex-row gap-8 text-gray-600 w-full bg-white md:bg-transparent px-8 py-4 md:py-2 items-center md:justify-center md:border-t md:border-gray-100`}
       >

       <li>
          <Link href="/">Accueil</Link>
        </li>
        <li>
          <Link href="/produits">Catalogue</Link>
        </li>
        <li
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <Link href="/categories" className="block py-2">
            Categories
          </Link>

          {showDropdown && (
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-20">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/produits?category_id=${category.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </li>
      </ul>
    </nav>
     </>
  );
}
