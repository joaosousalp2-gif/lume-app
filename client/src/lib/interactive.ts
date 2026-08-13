export function setupSmoothScrolling() {
  if (typeof window === "undefined") return;
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = (e.currentTarget as HTMLAnchorElement)?.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

export function setupTabsBehavior(containerSelector: string, tabButtonSelector: string, panelSelector: string) {
  if (typeof window === "undefined") return;
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const buttons = container.querySelectorAll(tabButtonSelector);
  const panels = container.querySelectorAll(panelSelector);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.add("hidden"));

      btn.classList.add("active");
      const targetPanel = container.querySelector(`#${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.remove("hidden");
      }
    });
  });
}
