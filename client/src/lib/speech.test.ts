import { describe, expect, it } from "vitest";
import { choosePortugueseVoice, cleanSpeechText } from "./speech";

describe("speech helpers", () => {
  it("removes markdown, URLs and pauses mecânicas", () => {
    expect(cleanSpeechText("**Olá** — veja https://lume.app ...!!")).toBe("Olá, veja.");
  });

  it("mantém uma resposta curta e legível para TTS", () => {
    expect(cleanSpeechText("  O seu saldo é de R$ 1.200,00.  ")).toBe("O seu saldo é de R$ 1.200,00.");
  });

  it("prefere pt-BR e respeita perfil feminino ou masculino", () => {
    const voices = [
      { name: "Daniel", lang: "pt-PT" } as SpeechSynthesisVoice,
      { name: "Helena", lang: "pt-BR" } as SpeechSynthesisVoice,
      { name: "Google português", lang: "pt-BR" } as SpeechSynthesisVoice,
    ];
    expect(choosePortugueseVoice(voices, "pt-BR-feminina")?.name).toBe("Helena");
    expect(choosePortugueseVoice(voices, "pt-BR-natural")?.name).toBe("Helena");
  });
});
