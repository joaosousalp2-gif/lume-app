/**
 * Accessibility (a11y) Utilities
 * Helper functions for WCAG 2.1 AA compliance
 */

/**
 * Generate unique ID for aria-describedby and aria-labelledby
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: "polite" | "assertive" = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus trap for modals
 */
export const createFocusTrap = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener("keydown", handleKeyDown);

  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
};

/**
 * Check color contrast ratio (WCAG)
 */
export const getContrastRatio = (rgb1: string, rgb2: string): number => {
  const getLuminance = (rgb: string): number => {
    const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate contrast ratio
 */
export const isContrastValid = (rgb1: string, rgb2: string, level: "AA" | "AAA" = "AA"): boolean => {
  const ratio = getContrastRatio(rgb1, rgb2);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Skip to main content link component
 */
export const createSkipLink = (): HTMLElement => {
  const link = document.createElement('a');
  link.href = '#main-content';
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white';
  link.textContent = 'Pular para conteúdo principal';
  return link;
};

/**
 * Keyboard shortcut handler
 */
export const useKeyboardShortcut = (key: string, callback: () => void, ctrlKey = false): ((e: KeyboardEvent) => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === key && e.ctrlKey === ctrlKey) {
      e.preventDefault();
      callback();
    }
  };

  return handleKeyDown;
};

/**
 * Announce dynamic content updates
 */
export const announceUpdate = (message: string) => {
  const liveRegion = document.querySelector('[aria-live="polite"]') || document.querySelector('[aria-live="assertive"]');
  if (liveRegion) {
    liveRegion.textContent = message;
  } else {
    announceToScreenReader(message, "polite");
  }
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReaders = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
};

/**
 * Ensure heading hierarchy
 */
export const validateHeadingHierarchy = (container: HTMLElement): { valid: boolean; issues: string[] } => {
  const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const issues: string[] = [];
  let lastLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1]);
    if (index === 0 && level !== 1) {
      issues.push("Primeira heading deve ser h1");
    }
    if (level > lastLevel + 1) {
      issues.push(`Pulo de nível de heading: ${lastLevel} → ${level}`);
    }
    lastLevel = level;
  });

  return {
    valid: issues.length === 0,
    issues,
  };
};
