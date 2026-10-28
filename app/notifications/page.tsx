"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import NotificationsList from "@/components/NotificationsList";

export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/connexion");
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500 text-sm mb-6">
            Le suivi de vos commandes, paiements et devis.
          </p>
          <NotificationsList />
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}