"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, isAdmin } from "@/lib/api/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getCurrentUser();

    if (!token || !isAdmin(user)) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return <div>Vérification...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900 min-h-screen">
        {children}
      </main>
    </div>
  );
}