import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Trash2, Zap, TrendingDown, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";
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
                    <div className="flex gap-2 mt-2">
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
              placeholder="Digite sua pergunta sobre finanças..."
              disabled={loading}
              className="flex-1 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
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
