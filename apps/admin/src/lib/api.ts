export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Try to get token, this assumes we store it in localStorage for the admin frontend
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("admin_token");
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
  }

  return response;
}
