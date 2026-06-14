export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api/v1";

export async function fetchApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchWithAuth(path: string, options?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function postApi<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message || "Permintaan gagal.");
  }
  return data as T;
}
