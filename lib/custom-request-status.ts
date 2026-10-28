export const CUSTOM_REQUEST_STATUSES = [
  { value: "en_attente", label: "En attente de devis", color: "bg-yellow-100 text-yellow-700" },
  { value: "devis_envoye", label: "Devis disponible", color: "bg-blue-100 text-blue-700" },
  { value: "expiree", label: "Devis expiré", color: "bg-orange-100 text-orange-700" },
  { value: "acceptee", label: "Devis accepté", color: "bg-green-100 text-green-700" },
  { value: "rejetee", label: "Non réalisable", color: "bg-red-100 text-red-700" },
  { value: "annulee", label: "Annulée", color: "bg-gray-100 text-gray-700" },
];

// Un devis dont la validité est dépassée s'affiche « expiré »
export function effectiveStatus(r: { status: string; is_expired?: boolean }) {
  return r.is_expired ? "expiree" : r.status;
}

export function getCustomStatusLabel(status: string) {
  return CUSTOM_REQUEST_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getCustomStatusColor(status: string) {
  return CUSTOM_REQUEST_STATUSES.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-700";
}