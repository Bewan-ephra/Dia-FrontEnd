import { apiFetch } from "./client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface LoginResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string) {
  const response = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }) as LoginResponse;

  localStorage.setItem("token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));

  return response.user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}