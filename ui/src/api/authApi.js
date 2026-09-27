const TOKEN_KEY = "rag_auth_token";
const USER_KEY = "rag_auth_user";

export function getBackendApiBase() {
  return import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username, password) {
  const res = await fetch(`${getBackendApiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function register(username, password, email = null) {
  const res = await fetch(`${getBackendApiBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function getCurrentUser() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) return null;

  const res = await fetch(`${getBackendApiBase()}/api/auth/me`, {
    headers,
  });

  if (!res.ok) {
    // If token expired or invalid, clear stored session
    setStoredToken(null);
    setStoredUser(null);
    return null;
  }

  const user = await res.json();
  setStoredUser(user);
  return user;
}

export function logout() {
  setStoredToken(null);
  setStoredUser(null);
}

// ==========================================
// Admin User Management API
// ==========================================

export async function getAllUsers() {
  const headers = getAuthHeaders();
  const res = await fetch(`${getBackendApiBase()}/api/admin/users`, {
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch users");
  }

  return res.json();
}

export async function adminCreateUser({ username, password, email, role = "user", is_active = true }) {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
  const res = await fetch(`${getBackendApiBase()}/api/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ username, password, email: email || null, role, is_active }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create user");
  }

  return res.json();
}

export async function updateUserStatus(userId, isActive) {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
  const res = await fetch(`${getBackendApiBase()}/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update user status");
  }

  return res.json();
}

export async function updateUserRole(userId, role) {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
  const res = await fetch(`${getBackendApiBase()}/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update user role");
  }

  return res.json();
}

export async function deleteUser(userId) {
  const headers = getAuthHeaders();
  const res = await fetch(`${getBackendApiBase()}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete user");
  }

  return res.json();
}
