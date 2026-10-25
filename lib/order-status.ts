export const ORDER_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "en_attente", label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  { value: "confirmee", label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  { value: "expediee", label: "Expédiée", color: "bg-purple-100 text-purple-700" },
  { value: "livree", label: "Livrée", color: "bg-green-100 text-green-700" },
  { value: "annulee", label: "Annulée", color: "bg-red-100 text-red-700" },
];

export const PAYMENT_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "non_paye", label: "Non payé", color: "bg-gray-100 text-gray-700" },
  { value: "paye", label: "Payé", color: "bg-green-100 text-green-700" },
  { value: "echoue", label: "Échoué", color: "bg-red-100 text-red-700" },
];

export function getStatusLabel(status: string) {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getStatusColor(status: string) {
  return ORDER_STATUSES.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-700";
}

export function getPaymentStatusLabel(status: string) {
  return PAYMENT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getPaymentStatusColor(status: string) {
  return PAYMENT_STATUSES.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-700";
}

export function getPaymentMethodLabel(method: string) {
  if (method === "whatsapp") return "WhatsApp";
  if (method === "en_ligne") return "Paiement en ligne";
  return method;
}