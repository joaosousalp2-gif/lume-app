import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { prepareFinancialAction } from "./financialActions";

describe("financial actions", () => {
  it("prepara uma despesa em português com valor e categoria", () => {
    const action = prepareFinancialAction("Lume, regista uma despesa de R$ 35,90 no supermercado");
    expect(action).not.toBeNull();
    expect(action?.type).toBe("create_launch");
    expect(action?.launch.type).toBe("despesa");
    expect(action?.launch.value).toBe("35.90");
    expect(action?.launch.category).toBe("Supermercado");
    expect(action?.confirmationText).toContain("35,90");
  });

  it("prepara receitas e não inventa operação quando faltam dados", () => {
    const income = prepareFinancialAction("Regista uma receita de 1200 do salário");
    expect(income?.launch.type).toBe("receita");
    expect(income?.launch.value).toBe("1200.00");
    expect(prepareFinancialAction("Quanto gastei este mês?")).toBeNull();
  });

  it("expõe prepare e confirm no router", () => {
    expect(appRouter._def.procedures).toHaveProperty("financialActions.prepare");
    expect(appRouter._def.procedures).toHaveProperty("financialActions.confirm");
  });
});
