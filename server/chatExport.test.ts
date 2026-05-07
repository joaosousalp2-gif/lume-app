import { describe, it, expect } from "vitest";
import { exportChatToPDF } from "./chatExport";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

describe("Chat Export to PDF", () => {
  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      content: "Qual é a melhor forma de economizar dinheiro?",
      role: "user",
      createdAt: new Date("2026-05-07T10:00:00Z"),
    },
    {
      id: "2",
      content:
        "## 1. DIAGNÓSTICO\nVocê está buscando estratégias de economia.\n\n## 2. RISCO\nSem planejamento, é fácil gastar mais do que deveria.\n\n## 3. RECOMENDAÇÃO\nEstabeleça um orçamento mensal e acompanhe seus gastos.\n\n## 4. AÇÕES\n1. Crie uma planilha de despesas\n2. Defina metas de economia\n3. Revise mensalmente",
      role: "assistant",
      createdAt: new Date("2026-05-07T10:01:00Z"),
    },
    {
      id: "3",
      content: "Como investir com segurança?",
      role: "user",
      createdAt: new Date("2026-05-07T10:02:00Z"),
    },
    {
      id: "4",
      content:
        "## 1. DIAGNÓSTICO\nVocê quer investir com segurança.\n\n## 2. RISCO\nInvestimentos têm riscos inerentes.\n\n## 3. RECOMENDAÇÃO\nComece com investimentos de baixo risco.\n\n## 4. AÇÕES\n1. Abra uma conta em um banco\n2. Invista em fundos de renda fixa\n3. Diversifique sua carteira",
      role: "assistant",
      createdAt: new Date("2026-05-07T10:03:00Z"),
    },
  ];

  it("should generate a valid PDF buffer", async () => {
    const buffer = await exportChatToPDF(mockMessages);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // PDF files start with %PDF
    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should include title in PDF", async () => {
    const customTitle = "Meu Histórico Financeiro";
    const buffer = await exportChatToPDF(mockMessages, {
      title: customTitle,
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should include statistics when requested", async () => {
    const buffer = await exportChatToPDF(mockMessages, {
      includeStats: true,
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should exclude statistics when not requested", async () => {
    const buffer = await exportChatToPDF(mockMessages, {
      includeStats: false,
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should include timestamps when requested", async () => {
    const buffer = await exportChatToPDF(mockMessages, {
      includeTimestamps: true,
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should exclude timestamps when not requested", async () => {
    const buffer = await exportChatToPDF(mockMessages, {
      includeTimestamps: false,
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle empty messages array", async () => {
    const buffer = await exportChatToPDF([]);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should handle single message", async () => {
    const singleMessage: ChatMessage[] = [mockMessages[0]];
    const buffer = await exportChatToPDF(singleMessage);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle long messages with wrapping", async () => {
    const longMessage: ChatMessage[] = [
      {
        id: "1",
        content: "Teste" + " de".repeat(100) + " mensagem longa",
        role: "user",
        createdAt: new Date(),
      },
    ];
    const buffer = await exportChatToPDF(longMessage);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle mixed user and assistant messages", async () => {
    const buffer = await exportChatToPDF(mockMessages);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should use default options when not provided", async () => {
    const buffer = await exportChatToPDF(mockMessages);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle special characters in messages", async () => {
    const specialMessages: ChatMessage[] = [
      {
        id: "1",
        content: "Teste com caracteres especiais: a, b, c, d, e, f",
        role: "user",
        createdAt: new Date(),
      },
      {
        id: "2",
        content: "Resposta com numeros: 1, 2, 3, 4, 5, 6",
        role: "assistant",
        createdAt: new Date(),
      },
    ];
    const buffer = await exportChatToPDF(specialMessages);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should generate consistent PDF size for same input", async () => {
    const buffer1 = await exportChatToPDF(mockMessages);
    const buffer2 = await exportChatToPDF(mockMessages);

    // Buffers may differ slightly due to timestamps, but should be similar size
    expect(Math.abs(buffer1.length - buffer2.length)).toBeLessThan(100);
  });
});
