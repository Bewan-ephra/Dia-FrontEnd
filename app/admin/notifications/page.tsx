"use client";
import NotificationsList from "@/components/NotificationsList";

export default function AdminNotificationsPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-3xl">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h1>
      <NotificationsList />
    </div>
  );
}