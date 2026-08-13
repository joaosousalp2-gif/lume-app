export const TOUR_STEPS = [
  {
    title: "Comece pelo resumo",
    text: "Veja o seu saldo, receitas e despesas no relatório mensal.",
    target: "#funcionalidades",
  },
  {
    title: "Explore as áreas do Lume",
    text: "Use as abas para consultar finanças, segurança e análise com menos cliques.",
    target: "#funcionalidades",
  },
  {
    title: "Peça ajuda ao Agente IA",
    text: "Quando precisar, abra o Agente IA para tirar dúvidas sobre a sua vida financeira.",
    target: 'a[href="/dashboard/chat"]',
  },
] as const;

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
      if (targetPanel) targetPanel.classList.remove("hidden");
    });
  });
}

export function setupOnboardingTour() {
  if (typeof window === "undefined") return () => undefined;
  const root = document.querySelector<HTMLElement>("#lume-tutorial");
  if (!root) return () => undefined;

  try {
    if (window.localStorage.getItem("lume-tutorial-dismissed") === "1") {
      return () => undefined;
    }
  } catch {
    // Storage may be unavailable in private browsing; the tour still works for this session.
  }

  const title = root.querySelector<HTMLElement>("[data-tour-title]");
  const text = root.querySelector<HTMLElement>("[data-tour-text]");
  const counter = root.querySelector<HTMLElement>("[data-tour-counter]");
  const nextButton = root.querySelector<HTMLButtonElement>("[data-tour-next]");
  const closeButton = root.querySelector<HTMLButtonElement>("[data-tour-close]");
  let currentStep = 0;

  const renderStep = () => {
    const step = TOUR_STEPS[currentStep];
    if (!step || !title || !text || !counter || !nextButton) return;
    title.textContent = step.title;
    text.textContent = step.text;
    counter.textContent = `${currentStep + 1} de ${TOUR_STEPS.length}`;
    nextButton.textContent = currentStep === TOUR_STEPS.length - 1 ? "Concluir" : "Próximo";
    root.hidden = false;
    document.querySelector(step.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dismiss = () => {
    root.hidden = true;
    try {
      window.localStorage.setItem("lume-tutorial-dismissed", "1");
    } catch {
      // Ignore storage failures while keeping the close interaction functional.
    }
  };

  const handleNext = () => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      dismiss();
      return;
    }
    currentStep += 1;
    renderStep();
  };

  nextButton?.addEventListener("click", handleNext);
  closeButton?.addEventListener("click", dismiss);
  renderStep();

  return () => {
    nextButton?.removeEventListener("click", handleNext);
    closeButton?.removeEventListener("click", dismiss);
  };
}
