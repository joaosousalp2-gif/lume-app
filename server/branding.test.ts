import { describe, expect, it } from "vitest";

describe("branding configuration", () => {
  it("uses the official Lume logo storage path", () => {
    expect(process.env.VITE_APP_LOGO).toBe("/manus-storage/lume-logo-official_0b7827ba.png");
  });
});
