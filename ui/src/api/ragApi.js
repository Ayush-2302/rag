import { getAuthHeaders, getBackendApiBase } from "./authApi";

export { getBackendApiBase };

export async function askBackendQuestion(question, collectionName = null, { signal } = {}) {
  const trimmed = (question ?? "").trim();
  if (!trimmed) throw new Error("Please enter a question.");

  const res = await fetch(`${getBackendApiBase()}/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ 
      question: trimmed,
      collection_name: collectionName 
    }),
    signal,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed (${res.status})`);
  }
  return await res.json();
}

export async function askRagAppQuestion(query, fileName, { signal } = {}) {
  const trimmed = (query ?? "").trim();
  if (!trimmed) throw new Error("Please enter a question.");

  const res = await fetch(`${getBackendApiBase()}/api/pdf-query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ query: trimmed, file_name: fileName }),
    signal,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed (${res.status})`);
  }
  return await res.json();
}

export async function uploadDocument(file, database) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("database", database);

  const res = await fetch(`${getBackendApiBase()}/api/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Upload failed");
  }
  return await res.json();
}

export async function getCollections() {
  const res = await fetch(`${getBackendApiBase()}/api/collections`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch collections");
  }
  return await res.json();
}

export async function askQuestion(question, { signal } = {}) {
  return askBackendQuestion(question, { signal });
}

