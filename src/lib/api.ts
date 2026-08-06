import type { MixerEntry, MixerListResponse, PickResult } from "@/lib/types";

const API_URL = "";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = token;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  auth: {
    register: (data: { username: string; password: string }) =>
      request<{ message: string }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      request<{ token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  },
  user: {
    profile: (token: string) =>
      request<{ id: number; username: string; balance: number; xp: number; level: number }>(
        "/api/user/profile",
        { token }
      ),
  },
  inventory: {
    export: (token: string) =>
      request<{ inventory_list: Array<{ id: number; user_id: number; material_id: number; material_name: string; amount: number; date_time: string }> | null }>(
        "/api/inventory/export",
        { token }
      ).then((res) => res.inventory_list ?? []),
  },
  market: {
    export: (token: string) =>
      request<{ market_list: Array<{ id: number; user_id: number; material_id: number; username: string; material_name: string; amount: number; price: number; date_time: string }> | null }>(
        "/api/market/export",
        { token }
      ).then((res) => res.market_list ?? []),
    sell: (token: string, data: { material_id: number; amount: number }) =>
      request<{ message: string }>("/api/market/set-for-sell", {
        method: "POST",
        token,
        body: JSON.stringify(data),
      }),
    buy: (token: string, data: { market_id: number; amount: number }) =>
      request<{ message: string }>("/api/market/buy", {
        method: "POST",
        token,
        body: JSON.stringify(data),
      }),
  },
  mixer: {
    mixes: (token: string) =>
      request<MixerListResponse>("/api/mixer", { token }).then((res) => res.mixes ?? []),
    add: (token: string, data: { first_ingredient_id: number; second_ingredient_id: number; amount: number }) =>
      request<{ message: string }>("/api/mixer", { method: "POST", token, body: JSON.stringify(data) }),
    checkTime: (token: string, data: { id: number }) =>
      request<MixerEntry>("/api/mixer/check", { method: "POST", token, body: JSON.stringify(data) }),
    pick: (token: string, data: { id: number }) =>
      request<PickResult>("/api/mixer", { method: "PATCH", token, body: JSON.stringify(data) }),
    pickNew: (token: string, data: { id: number; name: string; price: number; mix_time: number }) =>
      request<MixerEntry>("/api/mixer/new", { method: "PATCH", token, body: JSON.stringify(data) }),
  },
};
