import { useEffect } from "react";
import { setupOnboardingTour } from "@/lib/interactive";

export default function TutorialOverlay() {
  useEffect(() => setupOnboardingTour(), []);

  return (
    <aside
      id="lume-tutorial"
      className="lume-tutorial"
      hidden
      role="dialog"
      aria-modal="false"
      aria-labelledby="lume-tutorial-title"
      aria-describedby="lume-tutorial-text"
    >
      <div className="lume-tutorial__content">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="lume-tutorial__counter" data-tour-counter />
            <h2 id="lume-tutorial-title" data-tour-title className="lume-tutorial__title" />
          </div>
          <button type="button" data-tour-close className="lume-tutorial__close" aria-label="Fechar tutorial">
            ×
          </button>
        </div>
        <p data-tour-text id="lume-tutorial-text" className="lume-tutorial__text" />
        <div className="lume-tutorial__actions">
          <button type="button" data-tour-close className="lume-tutorial__skip">Pular</button>
          <button type="button" data-tour-next className="lume-btn-primary">Próximo</button>
        </div>
      </div>
    </aside>
  );
}
