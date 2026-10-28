const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiConfig {
  redirectOn401?: boolean;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  config: ApiConfig = {}
) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && endpoint !== "/login" && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (config.redirectOn401 !== false) {
      const loginPath = window.location.pathname.startsWith("/admin") ? "/login" : "/connexion";
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    const firstValidationError = error?.errors
      ? (Object.values(error.errors).flat()[0] as string | undefined)
      : undefined;

    throw new Error(
      firstValidationError ?? error?.message ?? `Erreur ${res.status} (${res.statusText})`
    );
  }

  return res.json();
}