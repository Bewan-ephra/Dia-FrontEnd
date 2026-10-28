"use client";
import { useEffect, useState } from "react";
import { getUnreadSummary, Summary } from "@/lib/api/inbox";

const EMPTY: Summary = { notifications_unread: 0, messages_unread: 0 };

export function useUnreadSummary(): Summary {
  const [summary, setSummary] = useState<Summary>(EMPTY);

  useEffect(() => {
    let alive = true;

    async function refresh() {
      if (document.visibilityState !== "visible") return;

      if (!localStorage.getItem("token")) {
        if (alive) setSummary(EMPTY);
        return;
      }

      try {
        const next = await getUnreadSummary();
        if (alive) setSummary(next);
      } catch {
        // Échec silencieux : un compteur raté ne doit rien afficher
      }
    }

    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("inbox:updated", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("inbox:updated", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return summary;
}