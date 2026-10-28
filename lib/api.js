import { apiFetch } from "./api/client";
 // uniquement pour resolveOrderItem (ancienne page commande)

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Navigation publique : une session expirée ne renvoie pas le visiteur vers la connexion
const SILENT = { redirectOn401: false };

function loggedIn() {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
}

function notifyCartChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart:updated"));
  }
}

// Connexion / inscription : réponse renvoyée telle quelle (token, user, errors, message)
async function postJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    return { message: "Trop de tentatives. Réessaie dans une minute." };
  }

  return res.json().catch(() => ({ message: `Erreur ${res.status}` }));
}

export function registerUser(name, email, password, passwordConfirmation) {
  return postJson("/register", {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
}

export function loginUser(email, password) {
  return postJson("/login", { email, password });
}

export async function logoutUser() {
  try {
    await apiFetch("/logout", { method: "POST" }, SILENT);
  } catch {
    // token déjà expiré : on déconnecte quand même côté navigateur
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  notifyCartChanged();
}

export function getMe(token) {
  return apiFetch("/me", {}, SILENT);
}

export function resendVerificationEmail() {
  return apiFetch("/email/resend", { method: "POST" });
}

// `query` = "expires=...&signature=..." (tel que reçu dans le lien de l'e-mail)
export function verifyEmail(id, hash, query) {
  return apiFetch(`/email/verify/${id}/${hash}?${query}`, {}, SILENT);
}

// ---------- Catalogue ----------

export function getCategories() {
  return apiFetch("/categories", {}, SILENT);
}

export function getCategoriesPublic() {
  return apiFetch("/categories", {}, SILENT);
}

export async function getProductsPage({ categoryId, search, onOrder, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category_id", String(categoryId));
  if (search) params.set("search", search);
  if (onOrder) params.set("on_order", "1");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();

  const res = await apiFetch(`/products${query ? `?${query}` : ""}`, {}, SILENT);

  return {
    items: res.data ?? [],
    lastPage: res.meta?.last_page ?? 1,
    total: res.meta?.total ?? 0,
  };
}

export async function getProducts(categoryId, search) {
  const { items } = await getProductsPage({ categoryId, search });
  return items;
}

export function getProduct(id) {
  return apiFetch(`/products/${id}`, {}, SILENT);
}

// ---------- Panier ----------

export function getCart(token) {
  return apiFetch("/cart", {}, SILENT);
}

export async function addToCart(token, productId, quantity, variantId = null) {
  const res = await apiFetch(
    "/cart/items",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        product_variant_id: variantId,
        quantity,
      }),
    },
    SILENT
  );
  notifyCartChanged();
  return res;
}

export async function updateCartItem(token, itemId, quantity) {
  const res = await apiFetch(
    `/cart/items/${itemId}`,
    { method: "PUT", body: JSON.stringify({ quantity }) },
    SILENT
  );
  notifyCartChanged();
  return res;
}

export async function removeFromCart(token, itemId) {
  const res = await apiFetch(`/cart/items/${itemId}`, { method: "DELETE" }, SILENT);
  notifyCartChanged();
  return res;
}

// ---------- Favoris : sur le compte si connecté, dans le navigateur sinon ----------

function readLocalFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

function lightProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image:
      p.image ??
      (p.images ?? []).find((i) => !i.color)?.url ??
      p.images?.[0]?.url ??
      null,
  };
}

export async function getFavorites() {
  if (loggedIn()) {
    return apiFetch("/wishlist", {}, SILENT);
  }
  return readLocalFavorites();
}

export async function getFavoriteIds() {
  if (loggedIn()) {
    try {
      return await apiFetch("/wishlist/ids", {}, SILENT);
    } catch {
      return [];
    }
  }
  return readLocalFavorites().map((p) => p.id);
}

export async function toggleFavorite(product, currentlyFavorite) {
  if (loggedIn()) {
    if (currentlyFavorite) {
      await apiFetch(`/wishlist/${product.id}`, { method: "DELETE" }, SILENT);
    } else {
      await apiFetch(
        "/wishlist",
        { method: "POST", body: JSON.stringify({ product_id: product.id }) },
        SILENT
      );
    }
    return;
  }

  const list = readLocalFavorites().filter((p) => p.id !== product.id);
  const updated = currentlyFavorite ? list : [...list, lightProduct(product)];
  localStorage.setItem("favorites", JSON.stringify(updated));
}

// À appeler juste après une connexion / inscription réussie
export async function syncLocalFavorites() {
  const local = readLocalFavorites();
  for (const p of local) {
    try {
      await apiFetch(
        "/wishlist",
        { method: "POST", body: JSON.stringify({ product_id: p.id }) },
        SILENT
      );
    } catch {
      // produit supprimé entre-temps : on l'ignore
    }
  }
  localStorage.removeItem("favorites");
}

// ---------- Adresses ----------

export function getAddresses() {
  return apiFetch("/addresses");
}

export function addAddress(address) {
  return apiFetch("/addresses", { method: "POST", body: JSON.stringify(address) });
}

export function removeAddress(id) {
  return apiFetch(`/addresses/${id}`, { method: "DELETE" });
}

// ---------- Commandes ----------

export function getMyOrders({ status, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return apiFetch(`/orders${query ? `?${query}` : ""}`);
}

export function getMyOrder(id) {
  return apiFetch(`/orders/${id}`);
}

export function getMyOrderCounts() {
  return apiFetch("/orders/counts", {}, SILENT);
}

export function getCheckoutQuote(payload) {
  return apiFetch("/checkout/quote", { method: "POST", body: JSON.stringify(payload) });
}

export function placeOrder(payload) {
  return apiFetch("/orders", { method: "POST", body: JSON.stringify(payload) });
}

// ---------- Divers ----------

export function getCategoryImage(categoryName) {
  const images = {
    "Vêtements": "/categories/vetements.jpg",
    "Chaussures": "/categories/chaussures.jpg",
  };
  return images[categoryName] || null;
}

export function trackRecentlyViewed(product) {
  const stored = localStorage.getItem("recentlyViewed");
  let recent = stored ? JSON.parse(stored) : [];
  recent = recent.filter((p) => p.id !== product.id);
  recent.unshift(product);
  recent = recent.slice(0, 4);
  localStorage.setItem("recentlyViewed", JSON.stringify(recent));
}

export function getRecentlyViewed() {
  const stored = localStorage.getItem("recentlyViewed");
  return stored ? JSON.parse(stored) : [];
}

// ---------- Avis ----------

export function submitReview(productId, { rating, content, title }) {
  return apiFetch(
    `/products/${productId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify({ rating, comment: content, title: title || null }),
    },
    SILENT
  );
}

// ---------- Mot de passe oublié ----------

export function forgotPassword(email) {
  return apiFetch(
    "/forgot-password",
    { method: "POST", body: JSON.stringify({ email }) },
    SILENT
  );
}

export function resetPassword({ token, email, password, passwordConfirmation }) {
  return apiFetch(
    "/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    },
    SILENT
  );
}