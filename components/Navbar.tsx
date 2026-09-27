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

const [showNavbar, setShowNavbar] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  function handleScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }

    setLastScrollY(currentScrollY);
  }

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/produits?search=${encodeURIComponent(search)}`);
    }
  }

  return (
    <>
      <div className="bg-orange-400 text-center py-2 text-sm text-white font-medium">
        🚚 ARTICLE ÉGALEMENT SUR COMMANDE 
      </div>
   
   <nav
  className={`bg-white shadow-md sticky top-0 z-30 transition-transform duration-300 ${
    showNavbar ? "translate-y-0" : "-translate-y-full"
  }`}
>
      
      <div className="flex items-center justify-between px-4 md:px-8 py-4 gap-3">
  <Link href="/" className="text-xl font-bold text-gray-800 flex-shrink-0">
    DIA
  </Link>

  <form
    onSubmit={handleSearch}
    className="flex items-center relative flex-1 max-w-xl"
  >
    <Search size={16} className="absolute left-3 text-black" />
    <input
      type="text"
      placeholder="Rechercher..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border border-black rounded-lg pl-9 pr-4 py-2 text-sm text-black w-full"
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
       } md:flex flex-col md:flex-row gap-8 text-black w-full bg-white md:bg-transparent px-8 py-4 md:py-2 items-center md:justify-center md:border-t md:border-gray-100`}
       >

       <li>
          <Link href="/" className="hover:text-orange-400">Accueil</Link>
        </li>
        <li>
          <Link href="/produits" className="hover:text-orange-400">Catalogue</Link>
        </li>
        <li
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <Link href="/categories" className=" hover:text-orange-400 block py-2">
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
