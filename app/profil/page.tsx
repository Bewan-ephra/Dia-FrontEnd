"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getMe, getFavorites, getAddresses } from "@/lib/api";
import { myOrders } from "@/lib/myOrders";
import { Package, MapPin, Heart, ChevronRight, LogOut } from "lucide-react";

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [addressesCount, setAddressesCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    getMe(token).then((data) => setUser(data));
    setFavoritesCount(getFavorites().length);
    setAddressesCount(getAddresses().length);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/connexion");
  }

  if (!user) {
    return <div>Chargement...</div>;
  }

  const initials = user.name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const shortcuts = [
    {
      href: "/commandes",
      icon: Package,
      title: "Mes commandes",
      description: "Suivre et consulter vos commandes",
    },
    {
      href: "/adresses",
      icon: MapPin,
      title: "Mes adresses",
      description: "Gérer vos adresses de livraison",
    },
    {
      href: "/favoris",
      icon: Heart,
      title: "Mes favoris",
      description: "Retrouver les produits que vous aimez",
    },
  ];

  const stats = [
    { label: "Commandes", value: myOrders.length },
    { label: "Favoris", value: favoritesCount },
    { label: "Adresses", value: addressesCount },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon profil</h1>

          <div className="bg-gradient-to-br from-black to-black rounded-2xl p-6 text-white relative overflow-hidden mb-6">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500 rounded-full opacity-30 blur-3xl"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xl font-bold">{user.name}</p>
                <p className="text-gray-300 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3 mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-gray-700/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-gray-300 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition"
                >
                  <div className="bg-orange-50 text-orange-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}