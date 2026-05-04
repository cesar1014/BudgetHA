import { fetchSameOrigin } from "./app/api-client.js";

function getTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  document.documentElement.classList.remove("theme-dark-early");
  const themeToggle = document.getElementById("login-theme-toggle");
  if (themeToggle) {
    themeToggle.checked = isDark;
    themeToggle.setAttribute("aria-checked", isDark ? "true" : "false");
    themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  }
}

function getPostLoginDestination(payload = null) {
  const requiresProjectSelection = Boolean(payload?.requiresProjectSelection);
  return requiresProjectSelection ? "/hub" : "/";
}

applyTheme(getTheme());

const themeToggle = document.getElementById("login-theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    const next = themeToggle.checked ? "dark" : "light";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

const form = document.getElementById("login-form");
const submitBtn = document.getElementById("submit-btn");
const errorMessage = document.getElementById("error-message");
const forceLogin = new URLSearchParams(window.location.search).get("force") === "1";

async function checkSession() {
  if (forceLogin) return;
  try {
    const response = await fetchSameOrigin("/api/auth/status");
    if (!response.ok) return;
    const payload = await response.json();
    if (payload?.authenticated) {
      window.location.replace(getPostLoginDestination(payload));
    }
  } catch {
    // Keep login screen.
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.dataset.idleLabel = submitBtn.textContent;
  submitBtn.textContent = "Entrando...";

  const requestPayload = {
    username: form.username.value.trim(),
    password: form.password.value,
  };

  try {
    const response = await fetchSameOrigin("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      let message = "Falha ao autenticar.";
      try {
        const body = await response.json();
        message = body?.error || message;
      } catch {
        // Keep default message.
      }
      throw new Error(message);
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    window.location.replace(getPostLoginDestination(payload));
  } catch (error) {
    errorMessage.textContent = error?.message || "Falha ao autenticar.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.setAttribute("aria-busy", "false");
    submitBtn.textContent = submitBtn.dataset.idleLabel || "Entrar";
    delete submitBtn.dataset.idleLabel;
  }
});

checkSession();
