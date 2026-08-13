import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { processVoiceInput } from "./voice";
import { storagePut } from "./storage";

vi.mock("./_core/voiceTranscription", () => ({
  transcribeAudio: vi.fn(async ({ audioUrl }) => {
    if (audioUrl.includes("error")) {
      return { error: "Falha na transcrição do áudio" };
    }
    return { text: "Quanto gastei com mercado este mês?", language: "pt", segments: [] };
  }),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key, _data, _mime) => ({
    key,
    url: `https://storage.example.com/${key}`,
  })),
  storageGetSignedUrl: vi.fn(async (key) => `https://storage.example.com/signed/${key}`),
}));

describe("Voice processing router and robust helper tests", () => {
  it("exposes voiceRouter under appRouter with transcribeVoice procedure", () => {
    expect(appRouter._def.procedures).toHaveProperty("voice.transcribeVoice");
  });

  it("successfully processes voice input buffer and returns transcription text", async () => {
    const dummyBuffer = Buffer.from("fake-audio-bytes");
    const result = await processVoiceInput(dummyBuffer, 123);
    expect(result).toBe("Quanto gastei com mercado este mês?");
  });

  it("throws error when transcription helper fails", async () => {
    const dummyBuffer = Buffer.from("error-audio-bytes");
    vi.mocked(storagePut).mockResolvedValueOnce({
      key: "error-file.webm",
      url: "https://storage.example.com/error-file.webm",
    } as any);
    await expect(processVoiceInput(dummyBuffer, 999)).rejects.toThrow();
  });
});
