"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/api/auth";

// Toutes les pages qui ne doivent JAMAIS afficher la sidebar ni exiger une connexion
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/register",
  "/admin/mot-de-passe-oublie",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  const isPublicPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPath) {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("token");
    const user = getCurrentUser();

    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }

    setIsChecking(false);
  }, [pathname, isPublicPath, router]);

  // Pages publiques (login, register, mot de passe oublié) : pas de sidebar, pas de vérification
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Pages protégées : affiche un état de chargement pendant la vérification
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Vérification de la connexion...</p>
      </div>
    );
  }

  // Une fois connecté et vérifié : layout normal avec sidebar
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-white text-gray-900 min-h-screen">
        {children}
      </main>
    </div>
  );
}