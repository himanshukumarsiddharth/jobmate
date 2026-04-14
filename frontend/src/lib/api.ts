const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Basic API helper with fetch
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Try to get token from localStorage if in browser
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token") || "";
  }

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "API Error";
    try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
    } catch(e) {}
    throw new Error(errorMessage);
  }

  return response.json();
}
