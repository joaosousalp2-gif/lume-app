import { describe, expect, it } from "vitest";
import { getReadableModeState } from "./readableMode";

describe("readable mode state", () => {
  it("is enabled only for the persisted active value", () => {
    expect(getReadableModeState("1")).toBe(true);
    expect(getReadableModeState("0")).toBe(false);
    expect(getReadableModeState(null)).toBe(false);
  });
});
