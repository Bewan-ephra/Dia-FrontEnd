export function formatPrice(value: string | number) {
  return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}