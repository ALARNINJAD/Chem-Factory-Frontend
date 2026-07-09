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
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  auth: {
    register: (data: { username: string; password: string }) =>
      request<{ token: string }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
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
      request<{ inventory_list: Array<{ id: number; user_id: number; material_id: number; material_name: string; amount: number; date_time: string }> }>(
        "/api/inventory/export",
        { token }
      ).then((res) => res.InventoryList ?? []),
  },
  market: {
    list: () =>
      request<Array<{ id: number; user_id: number; material_id: number; amount: number; price: number; date_time: string }>>(
        "/api/market"
      ),
    sell: (token: string, data: { material_id: number; number: number; price: number }) =>
      request("/api/market", { method: "POST", token, body: JSON.stringify(data) }),
    buy: (token: string, data: { seller_id: number; material_id: number; number: number; price: number }) =>
      request("/api/market/buy", { method: "POST", token, body: JSON.stringify(data) }),
  },
  mixer: {
    add: (token: string, data: { first_ingredient_id: number; second_ingredient_id: number; amount: number }) =>
      request("/api/mixer", { method: "POST", token, body: JSON.stringify(data) }),
    checkTime: (token: string, data: { id: number }) =>
      request("/api/mixer", { method: "POST", token, body: JSON.stringify(data) }),
    pick: (token: string, data: { id: number }) =>
      request("/api/mixer", { method: "PATCH", token, body: JSON.stringify(data) }),
    pickNew: (token: string, data: { id: number; name: string; price: number; mix_time: number }) =>
      request("/api/mixer/new", { method: "PATCH", token, body: JSON.stringify(data) }),
  },
};
