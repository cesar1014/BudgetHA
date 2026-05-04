(() => {
  try {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    if (isDark) {
      document.documentElement.classList.add("theme-dark-early");
    }
  } catch {
    // Ignore early-theme errors and let regular runtime theming handle fallback.
  }
})();
