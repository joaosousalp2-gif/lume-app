import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";

export async function processVoiceInput(audioBuffer: Buffer, userId: number): Promise<string> {
  // Salvar áudio temporariamente no S3 para transcrição
  const fileName = `voice-inputs/${userId}-${Date.now()}.webm`;
  const { url } = await storagePut(fileName, audioBuffer, "audio/webm");

  const transcription = await transcribeAudio({
    audioUrl: url,
    language: "pt",
    prompt: "Conversa financeira com assistente Lume",
  });

  if ("error" in transcription) {
    throw new Error(transcription.error);
  }

  return transcription.text || "";
}
