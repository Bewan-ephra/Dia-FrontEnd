const USE_MOCK = true; // passe à false quand l'API de ton frère est prête
import { mockProducts, mockCategories, mockCart, mockUser } from "./mockData";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function registerUser(name, email, password, passwordConfirmation) {
  if (USE_MOCK) return { user: mockUser, token: "fake-token-test" };

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  if (USE_MOCK) return { user: mockUser, token: "fake-token-test" };

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMe(token) {
  if (USE_MOCK) return mockUser;

  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function getProducts(categoryId) {
  if (USE_MOCK) {
    if (categoryId) {
      return mockProducts.filter((p) => p.category.id === Number(categoryId));
    }
    return mockProducts;
  }

  const url = categoryId
    ? `${API_URL}/products?category_id=${categoryId}`
    : `${API_URL}/products`;

  const res = await fetch(url, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  const data = await res.json();
  return data.data;
}

export async function getProduct(id) {
  if (USE_MOCK) {
    return mockProducts.find((p) => p.id === Number(id));
  }

  const res = await fetch(`${API_URL}/products/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function getCategoriesPublic() {
  if (USE_MOCK) return mockCategories;

  const res = await fetch(`${API_URL}/categories`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function getCart(token) {
  if (USE_MOCK) return mockCart;

  const res = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function addToCart(token, productId, quantity) {
  if (USE_MOCK) {
    console.log("Mock: produit ajouté au panier", productId, quantity);
    return mockCart;
  }

  const res = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      product_id: productId,
      product_variant_id: null,
      quantity,
    }),
  });
  return res.json();
}

export async function removeFromCart(token, itemId) {
  if (USE_MOCK) {
    console.log("Mock: article retiré du panier", itemId);
    return mockCart;
  }

  const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}


export function getFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavorite(product) {
  const favorites = getFavorites();
  const exists = favorites.find((p) => p.id === product.id);

  let updated;
  if (exists) {
    updated = favorites.filter((p) => p.id !== product.id);
  } else {
    updated = [...favorites, product];
  }

  localStorage.setItem("favorites", JSON.stringify(updated));
  return updated;
}

export function getAddresses() {
  const stored = localStorage.getItem("addresses");
  return stored ? JSON.parse(stored) : [];
}

export function addAddress(address) {
  const addresses = getAddresses();
  const updated = [...addresses, { id: Date.now(), ...address }];
  localStorage.setItem("addresses", JSON.stringify(updated));
  return updated;
}

export function removeAddress(id) {
  const addresses = getAddresses();
  const updated = addresses.filter((a) => a.id !== id);
  localStorage.setItem("addresses", JSON.stringify(updated));
  return updated;
}