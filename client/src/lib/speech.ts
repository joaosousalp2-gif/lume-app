export type SpeechProfile = "pt-BR-natural" | "pt-BR-feminina" | "pt-BR-masculina" | string;

export function cleanSpeechText(text: string): string {
  return text
    .replace(/[*_#`~>-]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[—–]/g, ",")
    .replace(/[!?]{2,}/g, "!")
    .replace(/\.{3,}/g, ".")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([.!?])([.!?])+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function choosePortugueseVoice(voices: SpeechSynthesisVoice[], profile: SpeechProfile): SpeechSynthesisVoice | undefined {
  const profileVoice = profile.includes("feminina")
    ? voices.find((voice) => /female|feminina|luciana|helena/i.test(voice.name))
    : profile.includes("masculina")
      ? voices.find((voice) => /male|masculina|daniel|felipe/i.test(voice.name))
      : undefined;

  return profileVoice
    || voices.find((voice) => voice.lang.toLowerCase() === "pt-br")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("pt"));
}
