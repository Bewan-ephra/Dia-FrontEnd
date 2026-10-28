import { apiFetch } from "./client";

const SILENT = { redirectOn401: false };

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface InboxNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  url: string | null;
  read: boolean;
  created_at: string;
}

export interface Summary {
  notifications_unread: number;
  messages_unread: number;
}

export interface ChatMessage {
  id: number;
  from_admin: boolean;
  body: string;
  created_at: string;
  read: boolean;
  order_id: number | null;
  custom_request_id: number | null;
}

export interface ChatContext {
  order_id?: number | null;
  custom_request_id?: number | null;
}

export interface ConversationRow {
  user_id: number;
  user: { id: number; name: string; email: string } | null;
  unread_count: number;
  last_message_at: string | null;
  last_message: { body: string; from_admin: boolean } | null;
}

export interface ConversationDetail {
  user: { id: number; name: string; email: string; phone: string | null };
  messages: ChatMessage[];
}

// ---------- Notifications ----------

export const getNotifications = (page = 1) =>
  apiFetch(`/notifications${page > 1 ? `?page=${page}` : ""}`) as Promise<Paginated<InboxNotification>>;

export const getUnreadSummary = () =>
  apiFetch("/notifications/summary", {}, SILENT) as Promise<Summary>;

export const markNotificationRead = (id: string) =>
  apiFetch(`/notifications/${id}/read`, { method: "POST" });

export const markAllNotificationsRead = () =>
  apiFetch("/notifications/read-all", { method: "POST" });

// ---------- Messages (client) ----------

export const getMyMessages = () => apiFetch("/messages") as Promise<{ messages: ChatMessage[] }>;

export const sendMessage = (body: string, context: ChatContext = {}) =>
  apiFetch("/messages", {
    method: "POST",
    body: JSON.stringify({ body, ...context }),
  }) as Promise<ChatMessage>;

// ---------- Messages (admin) ----------

export function getAdminConversations({
  search,
  unread,
  page,
}: { search?: string; unread?: boolean; page?: number } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (unread) params.set("unread", "1");
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();

  return apiFetch(`/admin/conversations${query ? `?${query}` : ""}`) as Promise<Paginated<ConversationRow>>;
}

export const getAdminConversation = (userId: number) =>
  apiFetch(`/admin/conversations/${userId}`) as Promise<ConversationDetail>;

export const replyToClient = (userId: number, body: string, context: ChatContext = {}) =>
  apiFetch(`/admin/conversations/${userId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body, ...context }),
  }) as Promise<ChatMessage>;