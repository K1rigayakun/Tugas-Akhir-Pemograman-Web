export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Try to get token, this assumes we store it in localStorage for the admin frontend
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("admin_token");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
