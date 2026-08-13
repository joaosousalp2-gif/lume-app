import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut, storageGetSignedUrl } from "./storage";

export async function processVoiceInput(audioBuffer: Buffer, userId: number): Promise<string> {
  // Salvar áudio temporariamente no S3 e obter URL assinada absoluta
  const fileName = `voice-inputs/${userId}-${Date.now()}.webm`;
  const { key } = await storagePut(fileName, audioBuffer, "audio/webm");
  const signedUrl = await storageGetSignedUrl(key);

  const transcription = await transcribeAudio({
    audioUrl: signedUrl,
    language: "pt",
    prompt: "Conversa financeira com assistente Lume",
  });

  if ("error" in transcription) {
    throw new Error(transcription.error);
  }

  return transcription.text || "";
}
