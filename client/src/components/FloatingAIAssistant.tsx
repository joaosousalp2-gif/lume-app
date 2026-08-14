import { useEffect, useRef, useState } from "react";
import { Brain, Mic, MicOff, MessageCircle, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type RecognitionEventLike = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionLike;

type WindowWithRecognition = Window & typeof globalThis & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

export const FLOATING_AI_QUICK_ACTIONS = [
  { label: "Ver o meu saldo", icon: WalletCards, prompt: "Mostra o meu saldo e explica como estão as minhas finanças este mês." },
  { label: "Registar uma despesa", icon: MessageCircle, prompt: "Quero registar uma nova despesa. Pergunta-me o valor, a categoria e a descrição." },
  { label: "Explicar alertas", icon: Brain, prompt: "Explica os meus alertas de despesas anómalas com palavras simples." },
];

export default function FloatingAIAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const openAgent = (prompt?: string) => {
    if (prompt) localStorage.setItem("lume-agent-prefill", prompt);
    window.location.href = "/dashboard/chat";
  };

  const startVoiceCommand = () => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognitionConstructor = (window as WindowWithRecognition).SpeechRecognition || (window as WindowWithRecognition).webkitSpeechRecognition;
    if (!recognitionConstructor) {
      openAgent("Quero falar por voz com o Agente IA.");
      return;
    }

    const recognition = new recognitionConstructor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      setListening(false);
      if (transcript) openAgent(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  return <div ref={rootRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" aria-label="Atalhos do Agente IA">
    {open && <div id="lume-ai-actions" className="w-72 rounded-2xl border border-blue-100 bg-white p-3 shadow-2xl" role="menu" aria-label="Ações rápidas do Agente IA">
      <div className="mb-2 flex items-center justify-between px-1"><strong className="text-slate-900">O que precisa?</strong><button type="button" onClick={() => setOpen(false)} aria-label="Fechar atalhos" className="rounded-full p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
      <div className="space-y-2">{FLOATING_AI_QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => <button key={label} type="button" role="menuitem" onClick={() => openAgent(prompt)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><Icon className="h-5 w-5 text-blue-600" />{label}</button>)}</div>
      <Button type="button" onClick={startVoiceCommand} className="mt-2 w-full gap-2" variant={listening ? "destructive" : "default"}>{listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{listening ? "A ouvir..." : "Ditar um comando"}</Button>
    </div>}
    <Button type="button" size="lg" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="lume-ai-actions" aria-haspopup="menu" aria-label={open ? "Fechar Agente IA" : "Abrir Agente IA"} className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 p-0 shadow-xl ring-4 ring-white/80 hover:scale-105"><Brain className="h-7 w-7 text-white" aria-hidden="true" /></Button>
  </div>;
}
