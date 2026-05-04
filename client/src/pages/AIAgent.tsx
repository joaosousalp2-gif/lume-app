/**
 * AIAgent — Agente Financeiro IA
 * Página dedicada para conversar com o assistente de finanças
 */

import { useState, useEffect, useRef } from "react";
import { Trash2, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Message } from "@/components/AIChatBox";

export default function AIAgent() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou seu Agente Financeiro IA. Sou aqui para ajudá-lo com suas finanças pessoais. Posso analisar seus investimentos, despesas, orçamentos e dar recomendações personalizadas. O que você gostaria de saber?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Carregar histórico de chat
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadHistory = async () => {
      try {
        const history = await (trpc as any).chat.getHistory.query();
        if (history && history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    };

    loadHistory();
  }, [isAuthenticated]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue("");

    // Adicionar mensagem do usuário
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setIsLoading(true);

    try {
      // Chamar API de chat via tRPC
      const response = await (trpc as any).chat.sendMessage.mutate({
        message: userMessage,
      });

      if (response?.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.message,
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Tem certeza que deseja limpar o histórico de chat?")) {
      try {
        await (trpc as any).chat.clearHistory.mutate();
        setMessages([
          {
            role: "assistant",
            content: "Histórico limpo! Como posso ajudá-lo agora?",
          },
        ]);
      } catch (error) {
        console.error("Erro ao limpar histórico:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Agente Financeiro IA</h1>
          <p className="text-blue-100">Seu assistente de finanças pessoais</p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-300px)] min-h-[600px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4 space-y-3">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre finanças..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>💡 Dica: Use Enter para enviar, Shift+Enter para nova linha</p>
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
