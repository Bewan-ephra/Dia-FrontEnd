"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getMe } from "@/lib/api";

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    getMe(token).then((data) => setUser(data));
  }, [router]);

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-8 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Nom</p>
          <p className="text-gray-900 font-medium mb-4">{user.name}</p>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="text-gray-900 font-medium">{user.email}</p>
        </div>
      </div>
    </>
  );
}