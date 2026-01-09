import React, { useState, useEffect } from "react";
import { User as UserEntity } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AIAssistant() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      setMessages([
        {
          role: "assistant",
          content: `Olá, ${userData.full_name}! 🎉\n\nSou seu amigo de aprendizado! Estou aqui para te ajudar com inglês e educação financeira de um jeito bem legal e divertido!\n\nPode me fazer qualquer pergunta! 😊`
        }
      ]);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const systemPrompt = `Você é um professor virtual muito amigável e divertido que ensina inglês e educação financeira para crianças e jovens.

IMPORTANTE - REGRAS DE FORMATAÇÃO:
- NUNCA use negrito (** ou __) em suas respostas
- NUNCA use hashtags (#)
- Use emojis para deixar mais divertido
- Organize suas explicações em tópicos numerados ou com bullet points simples (-)
- Seja lúdico, use analogias do dia a dia
- Fale de forma clara e amigável, como um amigo explicando
- Use exemplos práticos e do cotidiano
- Sempre encoraje e motive o aluno

Exemplos de como estruturar suas respostas:

Para explicar um conceito:
"Vou te explicar de um jeito bem fácil! 😊

1. Primeiro ponto importante...
2. Agora vamos entender...
3. Por último...

Exemplo prático: [explicação]"

Seja sempre positivo, encorajador e use uma linguagem adequada para jovens.`;

      const response = await InvokeLLM({
        prompt: `${systemPrompt}\n\nPergunta do aluno: ${userMessage}`
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Ops! Tive um probleminha aqui. Pode tentar de novo? 😅" 
      }]);
    }
    setLoading(false);
  };

  const suggestedQuestions = [
    "Como uso o present perfect?",
    "O que é Bitcoin?",
    "Qual a diferença entre much e many?",
    "Como funciona a bolsa de valores?",
    "Quais são os phrasal verbs mais comuns?",
    "O que são dividendos?"
  ];

  return (
    <div className="p-6 h-screen flex flex-col">
      <style>
        {`
          .neumorphic-card {
            background: #e0e0e0;
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
            border-radius: 20px;
          }
          .neumorphic-button {
            background: #e0e0e0;
            box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
            border: none;
            border-radius: 15px;
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
          }
          .neumorphic-input {
            background: #e0e0e0;
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            border: none;
            border-radius: 12px;
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="neumorphic-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-800">IA Assistant</h1>
          </div>
          <p className="text-gray-600">
            Seu professor virtual de inglês e educação financeira! 🎓💰
          </p>
        </div>

        <div className="neumorphic-card p-6 flex-1 flex flex-col mb-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-4 rounded-xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Perguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="neumorphic-button px-4 py-2 text-sm text-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Digite sua pergunta..."
              className="neumorphic-input flex-1 p-4 resize-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className={`neumorphic-button px-6 ${
                !input.trim() || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Send className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}