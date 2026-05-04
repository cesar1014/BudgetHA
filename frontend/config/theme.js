export function subscribeThemeChange(onChange) {
  if (typeof onChange !== "function") return () => {};

  const readTheme = () => document.body.classList.contains("theme-dark");
  const emit = () => onChange(readTheme());

  emit();

  const observer = new MutationObserver(() => {
    emit();
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}
