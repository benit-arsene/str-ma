const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "";
};

class AdminApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

async function adminRequest(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AdminApiError(
      response.status,
      data.error || `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return data;
}

export function adminLogin(username, password) {
  return adminRequest("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function adminLogout() {
  return adminRequest("/api/admin/logout", { method: "POST" });
}

export function fetchAdminStats() {
  return adminRequest("/api/admin/stats");
}

export function fetchAdminFinance({ page, limit, status, q } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return adminRequest(`/api/admin/finance${query ? `?${query}` : ""}`);
}

export function fetchAdminReservations({ page, limit, status, q } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return adminRequest(`/api/admin/reservations${query ? `?${query}` : ""}`);
}

export function fetchAdminReservation(id) {
  return adminRequest(`/api/admin/reservations/${id}`);
}

export function updateReservationStatus(id, status) {
  return adminRequest(`/api/admin/reservations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function isUnauthorizedError(error) {
  return error instanceof AdminApiError && error.status === 401;
}
