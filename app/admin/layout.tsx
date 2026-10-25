"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return <div>Vérification...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 h-screen shrink-0 self-start overflow-y-auto">
      <Sidebar />
      </div>
      <main className="flex-1 min-w-0 p-8 bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900 min-h-screen">
        {children}
      </main>
    </div>
    
  );
}