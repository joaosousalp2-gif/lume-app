import { describe, expect, it } from "vitest";
import { setupOnboardingTour, setupSmoothScrolling, setupTabsBehavior, TOUR_STEPS } from "./interactive";

describe("Interactive DOM helpers", () => {
  it("defines DOM helpers without throwing in non-browser environments", () => {
    expect(typeof setupSmoothScrolling).toBe("function");
    expect(typeof setupTabsBehavior).toBe("function");
    expect(typeof setupOnboardingTour).toBe("function");
  });

  it("exposes a short, ordered onboarding flow", () => {
    expect(TOUR_STEPS).toHaveLength(3);
    expect(TOUR_STEPS[0].target).toBe("#funcionalidades");
    expect(TOUR_STEPS.at(-1)?.target).toBe('a[href="/dashboard/chat"]');
  });
});
