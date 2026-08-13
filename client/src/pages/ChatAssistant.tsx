import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Trash2, Zap, TrendingDown, HelpCircle, ThumbsUp, ThumbsDown, Download, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";


interface ChatMessage {
  id: number;
  userId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ResponseQuality {
  hasStructure: boolean;
  hasDiagnosis: boolean;
  hasRisk: boolean;
  hasRecommendation: boolean;
  hasActions: boolean;
  score: number; // 0-100
}

function validateResponseStructure(content: string): ResponseQuality {
  const hasDiagnosis = /##\s*1\.\s*DIAGNÓSTICO|diagnóstico/i.test(content);
  const hasRisk = /##\s*2\.\s*RISCO|risco/i.test(content);
  const hasRecommendation = /##\s*3\.\s*RECOMENDAÇÃO|recomendação/i.test(content);
  const hasActions = /##\s*4\.\s*AÇÕES|ações|ação/i.test(content);
  const hasStructure = hasDiagnosis && hasRisk && hasRecommendation && hasActions;
  
  let score = 0;
  if (hasDiagnosis) score += 25;
  if (hasRisk) score += 25;
  if (hasRecommendation) score += 25;
  if (hasActions) score += 25;
  
  return {
    hasStructure,
    hasDiagnosis,
    hasRisk,
    hasRecommendation,
    hasActions,
    score,
  };
}

export default function ChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries e Mutations
  const historyQuery = trpc.chat.getHistory.useQuery(undefined, { enabled: !!user });
  const sendMutation = trpc.chat.sendMessage.useMutation();
  const clearMutation = trpc.chat.clearHistory.useMutation();
  const feedbackMutation = (trpc as any).chatFeedback.saveFeedback.useMutation();
  const exportMutation = (trpc as any).chatExport.exportPDF.useMutation();
  const voiceMutation = (trpc as any).voice.transcribeVoice.useMutation();
  const [exporting, setExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [continuousListening, setContinuousListening] = useState<boolean>(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch {}
      }
    };
  }, [recognitionInstance]);

  const toggleContinuousListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("O seu navegador não suporta reconhecimento de fala contínuo.");
      return;
    }

    if (continuousListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setRecognitionInstance(null);
      setContinuousListening(false);
      toast.info("Modo de escuta contínua desativado.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        // Exigir estritamente a palavra de ativação "lume"
        if (transcript.includes("lume")) {
          playBeep();
          const parts = transcript.split("lume");
          const cleanCommand = (parts[1] || parts[0] || "").trim();
          if (cleanCommand) {
            setInput(cleanCommand);
            toast.success(`Comando detetado via Lume: "${cleanCommand}"`);
          } else {
            toast.info("Diga o seu comando após 'Lume'.");
          }
        }
      };

      recognition.onerror = () => {
        // Ignorar erros menores de silêncio
      };

      recognition.onend = () => {
        // Reinício gerido pelo estado se ativo
      };

      recognition.start();
      setRecognitionInstance(recognition);
      setContinuousListening(true);
      playBeep();
      toast.success("Escuta ativada! Diga 'Lume' seguido da sua pergunta.");
    } catch {
      toast.error("Erro ao iniciar escuta contínua.");
    }
  };

  const playBeep = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext policy restriction fallback
    }
  };

  const speakText = (text: string, msgId: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Síntese de voz não suportada neste navegador.");
      return;
    }
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Remover asteriscos, markdown, tags e caracteres indesejados para soar 100% humano
    const cleanText = text
      .replace(/[*_#`~>-]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    utterance.rate = playbackRate;
    utterance.pitch = 0.98; // Tom ligeiramente mais natural e caloroso

    // Tentar selecionar voz pt-BR nativa de alta qualidade se disponível
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === "pt-BR" || v.lang.startsWith("pt")) || voices.find(v => v.lang.startsWith("pt"));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("O seu navegador não suporta gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = (reader.result as string)?.split(",")[1];
          if (!base64data) return;
          try {
            setLoading(true);
            const res = await voiceMutation.mutateAsync({ audioBase64: base64data });
            if (res && res.text) {
              setInput(res.text);
              toast.success("Áudio transcrito com sucesso!");
            }
          } catch {
            toast.error("Erro ao transcrever áudio.");
          } finally {
            setLoading(false);
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      playBeep();
      toast.info("A gravar áudio... Fale agora.");
    } catch {
      toast.error("Não foi possível aceder ao microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Load history on mount
  useEffect(() => {
    if (historyQuery.data) {
      setMessages(historyQuery.data as ChatMessage[]);
    }
  }, [historyQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      const result = await sendMutation.mutateAsync({ message: userMessage });

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          userId: user?.id || 0,
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        },
      ]);

      // Validate response structure
      const quality = validateResponseStructure(result.message);
      
      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          userId: user?.id || 0,
          role: "assistant",
          content: result.message,
          createdAt: new Date(),
        },
      ]);
      
      // Show quality indicator if response is not well-structured
      if (!quality.hasStructure && quality.score < 75) {
        console.warn("Response quality warning:", quality);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Tem certeza que deseja limpar o histórico de chat?")) {
      await clearMutation.mutateAsync();
      setMessages([]);
    }
  };

  const handleFeedback = async (messageId: number, message: ChatMessage, rating: "useful" | "not_useful") => {
    if (feedbackSubmitted.has(messageId)) return;

    try {
      await feedbackMutation.mutateAsync({
        messageContent: message.content,
        messageRole: message.role,
        messageTimestamp: new Date(message.createdAt),
        rating,
      });
      setFeedbackSubmitted((prev) => {
        const newSet = new Set(prev);
        newSet.add(messageId);
        return newSet;
      });
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
    }
  };

  const handleExportPDF = async () => {
    if (messages.length === 0) {
      toast.error("Nenhuma mensagem para exportar");
      return;
    }

    setExporting(true);
    try {
      const result = await exportMutation.mutateAsync({
        includeTimestamps: true,
        includeStats: true,
      });

      if (!result.success || !result.data) {
        toast.error(result.error || "Erro ao exportar chat");
        return;
      }

      // Convert base64 to blob and trigger download
      const binaryString = atob(result.data.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Chat exportado como ${result.data.filename}`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar chat para PDF");
    } finally {
      setExporting(false);
    }
  };

  const quickActions = [
    {
      label: "Analisar gastos",
      icon: TrendingDown,
      prompt: "Analise meus gastos este mês e me dê dicas de economia.",
    },
    {
      label: "Dicas de economia",
      icon: Zap,
      prompt: "Quais são as melhores dicas de economia para meu perfil de gastos?",
    },
    {
      label: "Perguntas frequentes",
      icon: HelpCircle,
      prompt: "Quais são as dúvidas mais comuns sobre finanças pessoais?",
    },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar autenticado para usar o Agente Financeiro.</p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">Fazer Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Agente Financeiro IA</h1>
            <p className="text-sm text-gray-600">Seu assistente de finanças pessoais</p>
          </div>
            <div className="flex gap-2 items-center flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 text-xs">
              <span className="text-gray-600 font-medium">Velocidade:</span>
              {[1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-1.5 py-0.5 rounded ${playbackRate === rate ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="gap-2"
              disabled={messages.length === 0 || exporting}
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exportando..." : "Exportar PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="gap-2"
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white rounded-lg p-8 max-w-md shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo!</h2>
              <p className="text-gray-600 mb-6">
                Sou seu assistente financeiro. Posso ajudá-lo a analisar seus gastos, oferecer dicas de economia e responder suas dúvidas sobre finanças.
              </p>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start gap-2 text-left"
                    onClick={() => {
                      setInput(action.prompt);
                    }}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm">
                      <Streamdown>{message.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 px-2 text-xs ${
                          feedbackSubmitted.has(message.id)
                            ? "opacity-50 cursor-default"
                            : "hover:bg-green-100"
                        }`}
                        onClick={() => handleFeedback(message.id, message, "useful")}
                        disabled={feedbackSubmitted.has(message.id)}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Útil
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 px-2 text-xs ${
                          feedbackSubmitted.has(message.id)
                            ? "opacity-50 cursor-default"
                            : "hover:bg-red-100"
                        }`}
                        onClick={() => handleFeedback(message.id, message, "not_useful")}
                        disabled={feedbackSubmitted.has(message.id)}
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Não útil
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs gap-1 ml-auto"
                        onClick={() => speakText(message.content, message.id)}
                      >
                        {speakingMessageId === message.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-red-500" />
                            Parar Áudio
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-blue-600" />
                            Ouvir Resposta
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Digitando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isRecording ? "A gravar áudio... Fale agora..." : "Digite sua dúvida ou use o microfone..."}
              disabled={loading || isRecording}
              className="flex-1 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={isRecording ? "animate-pulse gap-1" : "gap-1"}
              title={isRecording ? "Parar gravação" : "Falar por microfone"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600" />}
              <span className="hidden sm:inline">{isRecording ? "Parar" : "Voz"}</span>
            </Button>
            <Button
              type="button"
              variant={continuousListening ? "default" : "outline"}
              onClick={toggleContinuousListening}
              className={continuousListening ? "bg-green-600 hover:bg-green-700 text-white gap-1 animate-pulse" : "gap-1"}
              title="Escuta contínua com palavra 'Lume'"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">{continuousListening ? "A escutar" : "Lume"}</span>
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={loading || (!input.trim() && !isRecording)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Dica: Use Enter para enviar, Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}
