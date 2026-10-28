"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { useUnreadSummary } from "@/lib/useUnreadSummary";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function InboxBadges() {
  const [loggedIn, setLoggedIn] = useState(false);
  const summary = useUnreadSummary();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  if (!loggedIn) return null;

  return (
    <>
      <Link href="/notifications" aria-label="Notifications" className="relative text-gray-600 hover:text-blue-300">
        <Bell size={20} />
        <Badge count={summary.notifications_unread} />
      </Link>
      <Link href="/messages" aria-label="Messages" className="relative text-gray-600 hover:text-blue-300">
        <MessageCircle size={20} />
        <Badge count={summary.messages_unread} />
      </Link>
    </>
  );
}