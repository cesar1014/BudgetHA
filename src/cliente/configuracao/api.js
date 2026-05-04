function isApiRoute(url) {
  return typeof url === "string" && url.startsWith("/api/");
}

export async function requestJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      credentials: "same-origin",
      ...options,
    });
  } catch {
    throw new Error("Nao foi possivel conectar com a API. Reinicie o servidor com npm run dev.");
  }

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    let message = "Erro inesperado.";
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      message = response.statusText || message;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (isApiRoute(url) && !contentType.includes("application/json")) {
    throw new Error("API indisponivel ou desatualizada. Reinicie o servidor.");
  }

  return response.json();
}

export function getAuthStatus() {
  return requestJson("/api/auth/status");
}

export function getTopicos() {
  return requestJson("/api/topicos");
}

export function createTopico(payload) {
  return requestJson("/api/topicos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateTopico(topicId, payload) {
  return requestJson(`/api/topicos/${encodeURIComponent(topicId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteTopico(topicId) {
  return requestJson(`/api/topicos/${encodeURIComponent(topicId)}`, {
    method: "DELETE",
  });
}
