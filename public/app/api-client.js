export const API_NETWORK_ERROR_MESSAGE =
  "Nao foi possivel conectar com a API. Reinicie o servidor com npm run dev.";

export async function fetchSameOrigin(url, options = {}) {
  try {
    return await fetch(url, {
      credentials: "same-origin",
      ...options,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }
    throw new Error(API_NETWORK_ERROR_MESSAGE);
  }
}
