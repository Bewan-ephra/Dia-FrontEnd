const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      // Pas de Content-Type pour un FormData : le navigateur ajoute lui-même
      // la bonne "boundary", la forcer casserait l'upload
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Token expiré ou refusé : on nettoie et on renvoie vers la bonne page de connexion.
  // On exclut /login pour ne pas rediriger pendant une simple tentative de connexion.
  if (res.status === 401 && endpoint !== "/login" && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Admin : /login, client : /connexion
    const loginPath = window.location.pathname.startsWith("/admin")
      ? "/login"
      : "/connexion";

    if (window.location.pathname !== loginPath) {
      window.location.href = loginPath;
    }
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: `Erreur ${res.status} (${res.statusText})` }));
    throw new Error(error.message || "Une erreur est survenue");
  }

  return res.json();
}