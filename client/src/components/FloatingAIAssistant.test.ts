import { describe, expect, it } from "vitest";
import { FLOATING_AI_QUICK_ACTIONS } from "./FloatingAIAssistant";

describe("FloatingAIAssistant quick actions", () => {
  it("exposes the three concise shortcuts with useful prompts", () => {
    expect(FLOATING_AI_QUICK_ACTIONS).toHaveLength(3);
    expect(FLOATING_AI_QUICK_ACTIONS.map((action) => action.label)).toEqual([
      "Ver o meu saldo",
      "Registar uma despesa",
      "Explicar alertas",
    ]);
    expect(FLOATING_AI_QUICK_ACTIONS.every((action) => action.prompt.length > 20)).toBe(true);
  });
});
