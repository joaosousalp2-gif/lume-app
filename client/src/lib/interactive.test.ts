import { describe, expect, it } from "vitest";
import { setupSmoothScrolling, setupTabsBehavior } from "./interactive";

describe("Interactive DOM helpers", () => {
  it("defines smooth scrolling and tabs behavior without throwing in non-browser environments", () => {
    expect(typeof setupSmoothScrolling).toBe("function");
    expect(typeof setupTabsBehavior).toBe("function");
  });
});
