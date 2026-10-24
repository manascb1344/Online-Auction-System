import { getSession } from "../auth/session";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getSession()?.token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Cannot reach the API. Is the server running?");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event("auction:unauthorized"));
    }
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "HTTP_ERROR",
      payload?.error?.message ?? `Request failed with status ${response.status}`,
      payload?.error?.details,
    );
  }

  return payload?.data;
}

function toQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body, auth: false }),
  register: (body) => request("/auth/register", { method: "POST", body, auth: false }),
  me: () => request("/auth/me"),

  listItems: (params = {}) => request(`/items${toQuery(params)}`),
  getItem: (id) => request(`/items/${id}`),
  createItem: (body) => request("/items", { method: "POST", body }),
  myItems: () => request("/items/mine"),

  listBids: (itemId) => request(`/items/${itemId}/bids`),
  placeBid: (itemId, amount) => request(`/items/${itemId}/bids`, { method: "POST", body: { amount } }),
  myBids: () => request("/me/bids"),
  myTransactions: () => request("/me/transactions"),

  adminStats: () => request("/admin/stats"),
  adminAuctions: () => request("/admin/auctions"),
  adminBids: () => request("/admin/bids?limit=50"),
  adminTransactions: () => request("/admin/transactions"),
};

export { BASE_URL };
