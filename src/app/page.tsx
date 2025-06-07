"use client";

import { useState, useRef, useEffect } from "react";
import { 
  SendIcon, 
  BotIcon, 
  UserIcon, 
  SparklesIcon,
  LightbulbIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  PlusIcon,
  SettingsIcon,
  XIcon
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationAnalysis {
  keyPoints: string[];
  topics: Array<{
    name: string;
    importance: "high" | "medium" | "low";
    summary: string;
  }>;
  actionItems: string[];
  questions: string[];
  summary: string;
  nextSteps: string;
}

export default function FabotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [analysis, setAnalysis] = useState<ConversationAnalysis>({
    keyPoints: [],
    topics: [],
    actionItems: [],
    questions: [],
    summary: "",
    nextSteps: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 Análise automática forçada após cada mudança
  useEffect(() => {
    const analyzeWithDelay = async () => {
      if (messages.length > 0) {
        // Pequeno delay para garantir que a última mensagem foi processada
        setTimeout(() => {
          analyzeConversation();
        }, 500);
      }
    };
    
    analyzeWithDelay();
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeConversation = async () => {
    if (messages.length === 0) return;
    
    console.log('🔄 Iniciando análise da conversa...', { totalMessages: messages.length });
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const analysisResult = await response.json();
        console.log('✅ Visual Guide atualizado com sucesso:', analysisResult);
        setAnalysis(analysisResult);
      } else {
        console.error('❌ Erro na análise:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Detalhes do erro:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao analisar conversa:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    console.log('📤 Enviando mensagem:', userMessage.content);
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        console.log('📥 Resposta recebida, atualizando mensagens...');
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Erro: ${error instanceof Error ? error.message : 'Tente novamente.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* 🎨 Sidebar esquerda - estilo Libra */}
      <div className="w-16 bg-black/20 backdrop-blur-xl border-r border-purple-500/20 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex flex-col gap-3">
          <button className="w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl flex items-center justify-center transition-colors">
            <PlusIcon className="w-5 h-5 text-purple-300" />
          </button>
          <button className="w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl flex items-center justify-center transition-colors">
            <SettingsIcon className="w-5 h-5 text-purple-300" />
          </button>
        </div>
      </div>

      {/* 💬 Área principal do chat */}
      <div className="flex-1 flex flex-col">
        
        {/* Header com estilo Libra */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FABOT
              </h1>
              <p className="text-sm text-purple-300/80">
                Chat Multitasking
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg transition-colors text-sm border border-purple-500/30"
                >
                  Visual Guide
                </button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Área de mensagens com estilo Libra */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BotIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Bem-vindo ao FABOT!
              </h2>
              <p className="text-purple-300/80 mb-8 max-w-md mx-auto">
                Seu assistente inteligente com análise automática de conversas. Comece digitando qualquer pergunta.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "Como você funciona?",
                  "Explique machine learning",
                  "Dicas de programação"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl transition-colors border border-purple-500/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BotIcon className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-purple-300">
                    {message.role === 'user' ? 'Você' : 'FABOT'}
                  </span>
                  <span className="text-xs text-purple-400/60">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl backdrop-blur-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border border-purple-400/30'
                    : 'bg-black/40 border border-purple-500/20 text-purple-100'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
              <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3 text-purple-300">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">FABOT está pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area com estilo Libra */}
        <div className="border-t border-purple-500/20 bg-black/20 backdrop-blur-xl p-6">
          <form onSubmit={sendMessage} className="flex gap-4 items-end max-w-4xl mx-auto">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="w-full p-4 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl text-white placeholder-purple-400/60 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32 min-h-[3rem]"
                rows={1}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* ✨ Visual Guide - lado direito estilo Libra */}
      {showGuide && (
        <div className="w-80 bg-black/30 backdrop-blur-xl border-l border-purple-500/20 flex flex-col">
          
          {/* Header do Visual Guide */}
          <div className="p-4 border-b border-purple-500/20 bg-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-white">Visual Guide</h2>
                {isAnalyzing && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 hover:bg-purple-700/50 rounded transition-colors"
              >
                <XIcon className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </div>

          {/* Conteúdo do Visual Guide */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            
            {/* Status da análise */}
            <div className="text-center py-2">
              <p className="text-xs text-purple-400/80">
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    Analisando conversa...
                  </span>
                ) : messages.length > 0 ? (
                  `${messages.length} mensagens analisadas`
                ) : (
                  'Aguardando conversa...'
                )}
              </p>
            </div>

            {/* Resumo */}
            {analysis.summary && (
              <div className="bg-purple-900/30 rounded-xl p-3 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareIcon className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">Resumo</span>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Key Points */}
            {analysis.keyPoints.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LightbulbIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-300">Pontos Principais</span>
                </div>
                <div className="space-y-2">
                  {analysis.keyPoints.slice(0, 4).map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-xs text-yellow-100 leading-relaxed">{point}</p>
                    </div>
                  ))}
                  {analysis.keyPoints.length > 4 && (
                    <p className="text-xs text-purple-400/60 text-center py-1">
                      +{analysis.keyPoints.length - 4} pontos adicionais
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Perguntas Sugeridas */}
            {analysis.questions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircleIcon className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">Sugestões</span>
                </div>
                <div className="space-y-2">
                  {analysis.questions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="w-full text-left p-3 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-800/30 transition-colors"
                    >
                      <p className="text-xs text-purple-100 leading-relaxed">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            {analysis.actionItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-300">Próximas Ações</span>
                </div>
                <div className="space-y-2">
                  {analysis.actionItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                      <CheckCircleIcon className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-100 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximos Passos */}
            {analysis.nextSteps && (
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUpIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Próximos Passos</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {analysis.nextSteps}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
