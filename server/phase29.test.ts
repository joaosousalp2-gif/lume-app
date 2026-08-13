import { describe, expect, it } from "vitest";

describe("Phase 29: Natural speech cleaning and voice controls", () => {
  it("cleans markdown and asterisks correctly for natural voice synthesis", () => {
    const rawText = "**Atenção!** Seus gastos com *Mercado* subiram #muito. Acesse https://lume.app";
    const cleanText = rawText
      .replace(/[*_#`~>-]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    expect(cleanText).toBe("Atenção! Seus gastos com Mercado subiram muito. Acesse");
  });
});
