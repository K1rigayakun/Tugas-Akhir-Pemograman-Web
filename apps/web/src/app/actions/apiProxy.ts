"use server";

import { cookies } from "next/headers";
import { API_URL } from "../../lib/api";

export async function serverPostApi<T>(path: string, body: any): Promise<T> {
  const token = cookies().get("accessToken")?.value;
  
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }

  return data as T;
}

export async function serverGetApi<T>(path: string): Promise<T> {
  const token = cookies().get("accessToken")?.value;
  
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }

  return data as T;
}

export async function serverUploadApi<T>(path: string, formData: FormData): Promise<T> {
  const token = cookies().get("accessToken")?.value;
  
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }

  return data as T;
}
