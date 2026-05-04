/**
 * FloatingAIChat - Agente de IA flutuante para a página inicial
 * Componente que exibe o chat com IA em um painel flutuante
 */

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChatBox } from "./AIChatBox";
import type { Message } from "./AIChatBox";

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou o assistente IA do Lume. Como posso ajudá-lo com suas finanças hoje?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Adicionar mensagem do usuário
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
      },
    ]);

    setIsLoading(true);

    try {
      // Chamar API de chat via tRPC
      const response = await fetch("/api/trpc/ai.chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          json: {
            message: content,
            context: "Você é um assistente financeiro amigável do Lume App. Ajude o usuário com dúvidas sobre gestão financeira, segurança, e funcionalidades do app.",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.result?.data?.response || "Desculpe, não consegui processar sua mensagem.";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiResponse,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao chamar IA:", error);
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

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
          aria-label="Abrir chat com IA"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden group-hover:inline text-sm font-medium">Assistente IA</span>
        </button>
      )}

      {/* Painel de Chat Flutuante */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Assistente Lume</h3>
              <p className="text-sm text-blue-100">Powered by IA</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Digite sua pergunta sobre finanças..."
              height="100%"
            />
          </div>
        </div>
      )}

      {/* Overlay quando chat está aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
