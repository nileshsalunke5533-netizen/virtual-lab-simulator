const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAuthToken() {
  return localStorage.getItem("labsimToken");
}

export function saveAuthToken(token) {
  localStorage.setItem("labsimToken", token);
}

export function clearAuthToken() {
  localStorage.removeItem("labsimToken");
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Cannot reach the LabSim API. Check that the backend is running.");
  }

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      responseBody?.error || `Request failed (${response.status}).`,
      response.status
    );
  }
  return responseBody;
}
