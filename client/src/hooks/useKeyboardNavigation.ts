import { useEffect } from "react";

/**
 * Hook para gerenciar navegação por teclado
 * Suporta: Tab, Shift+Tab, Enter, Escape, Arrow keys
 */

export const useKeyboardNavigation = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const focusableArray = Array.from(focusableElements);
      const currentIndex = focusableArray.indexOf(activeElement);

      switch (e.key) {
        case "Tab":
          if (e.shiftKey) {
            // Shift+Tab: move to previous element
            if (currentIndex === 0) {
              e.preventDefault();
              focusableArray[focusableArray.length - 1].focus();
            }
          } else {
            // Tab: move to next element
            if (currentIndex === focusableArray.length - 1) {
              e.preventDefault();
              focusableArray[0].focus();
            }
          }
          break;

        case "Enter":
          if (activeElement instanceof HTMLButtonElement || activeElement instanceof HTMLAnchorElement) {
            activeElement.click();
          }
          break;

        case "Escape":
          // Close modal or menu
          const closeButton = container.querySelector('[aria-label*="Fechar"], [aria-label*="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
          break;

        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : focusableArray.length - 1;
          focusableArray[prevIndex].focus();
          break;

        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          const nextIndex = currentIndex + 1 < focusableArray.length ? currentIndex + 1 : 0;
          focusableArray[nextIndex].focus();
          break;

        case " ":
          // Space: activate button or checkbox
          if (activeElement instanceof HTMLButtonElement || activeElement instanceof HTMLInputElement) {
            e.preventDefault();
            activeElement.click();
          }
          break;

        default:
          break;
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef]);
};

/**
 * Hook para gerenciar focus trap em modais
 */
export const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when modal opens
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, containerRef]);
};

/**
 * Hook para gerenciar atalhos de teclado globais
 */
export const useGlobalKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se usuário está digitando em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+K: busca
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        shortcuts["ctrl+k"]?.();
      }

      // Ctrl+/: ajuda
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        shortcuts["ctrl+/"]?.();
      }

      // Ctrl+Enter: submit
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        shortcuts["ctrl+enter"]?.();
      }

      // Escape: fechar
      if (e.key === "Escape") {
        shortcuts["escape"]?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
};
