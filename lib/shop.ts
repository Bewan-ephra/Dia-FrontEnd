export const SHOP_WHATSAPP = "24160348225";

// « la moitié » pour 50 %, sinon « 30 % », « 40 %»...
export function depositLabel(rate: number) {
  return Math.abs(rate - 0.5) < 0.001 ? "la moitié" : `${Math.round(rate * 100)} %`;
}