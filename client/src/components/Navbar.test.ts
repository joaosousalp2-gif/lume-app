import { describe, expect, it } from "vitest";

describe("Navbar Navigation Links", () => {
  it("contains essential simplified navigation destinations", () => {
    const links = [
      { href: "#funcionalidades", label: "Finanças", tab: "financeiro" },
      { href: "#seguranca", label: "Segurança", tab: "seguranca" },
      { href: "#ai-analysis", label: "Análise", tab: "analise" },
      { href: "/dashboard/chat", label: "Agente IA", external: true },
      { href: "#download", label: "Baixar", tab: "download" },
    ];

    expect(links.length).toBe(5);
    expect(links.some((l) => l.label === "Finanças")).toBe(true);
    expect(links.some((l) => l.label === "Agente IA" && l.external)).toBe(true);
  });
});
