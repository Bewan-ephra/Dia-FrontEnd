export function formatPrice(value: string | number) {
  return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}