"use client";

import { useState, useRef, useEffect } from "react";
import { 
  SendIcon, 
  BotIcon, 
  UserIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  LightbulbIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  TrendingUpIcon,
  MessageSquareIcon,
  SparklesIcon,
  ClockIcon,
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

export default function T3ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [analysis, setAnalysis] = useState<ConversationAnalysis>({
    keyPoints: [],
    topics: [],
    actionItems: [],
    questions: [],
    summary: "Inicie uma conversa para ver a análise automática",
    nextSteps: "Faça uma pergunta para começar"
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

  // 🔥 Analisar conversa automaticamente após mudanças
  useEffect(() => {
    if (messages.length > 0) {
      analyzeConversation();
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeConversation = async () => {
    if (messages.length === 0) return;
    
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
        setAnalysis(analysisResult);
        console.log('🎯 Visual Guide atualizado:', analysisResult);
      } else {
        console.error('❌ Erro na análise:', response.status);
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
    <div className="h-screen flex bg-gray-900">
      
      {/* 💬 Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                T3 Chat com Visual Guide
              </h1>
              <p className="text-sm text-gray-400">
                Chat inteligente com análise automática • Llama 3.1
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {!showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Visual Guide
                </button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online
              </div>
            </div>
          </div>
        </header>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <BotIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Bem-vindo ao T3 Chat!
              </h2>
              <p className="text-gray-400 mb-6">
                (Se você tiver uma ideia específica, sinta-se à vontade para me dizer e vamos começar a explorar!)
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Quem está por trás do modelo Groq?",
                  "Como funciona machine learning?",
                  "Dicas de programação"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-purple-700 text-purple-100 rounded-full text-sm hover:bg-purple-600 transition-colors"
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
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <BotIcon className="w-4 h-4" />
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-300">
                    {message.role === 'user' ? 'Você' : 'IA'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white border border-purple-500'
                    : 'bg-gray-800 border border-gray-700 text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <BotIcon className="w-4 h-4" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm ml-2">IA está digitando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Área de Input */}
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32 min-h-[3rem]"
                  rows={1}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-colors flex items-center justify-center"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </form>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Chat inteligente com análise automática de conversa
            </p>
          </div>
        </div>
      </div>

      {/* ✨ Visual Guide Minimalista - LADO DIREITO */}
      <div className={`bg-gray-800 border-l border-gray-700 transition-all duration-300 ${
        showGuide ? 'w-80' : 'w-0'
      } overflow-hidden flex flex-col`}>
        
        {/* Header Minimalista */}
        <div className="p-3 border-b border-gray-700 bg-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-purple-300" />
              <h2 className="text-sm font-semibold text-white">Visual Guide</h2>
              {isAnalyzing && (
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 hover:bg-purple-700/50 rounded transition-colors"
            >
              <XIcon className="w-4 h-4 text-purple-200" />
            </button>
          </div>
        </div>

        {/* Conteúdo Minimalista */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
          
          {/* Resumo Compacto */}
          {analysis.summary && (
            <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareIcon className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Resumo</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          )}

          {/* Pontos Principais - Compacto */}
          {analysis.keyPoints.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LightbulbIcon className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-300">Pontos-chave</span>
              </div>
              <div className="space-y-1">
                {analysis.keyPoints.slice(0, 3).map((point, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded bg-yellow-900/30 border border-yellow-700/30">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs text-yellow-100 leading-relaxed">{point}</p>
                  </div>
                ))}
                {analysis.keyPoints.length > 3 && (
                  <p className="text-xs text-gray-400 text-center py-1">
                    +{analysis.keyPoints.length - 3} mais...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Perguntas Sugeridas - Compacto */}
          {analysis.questions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircleIcon className="w-3 h-3 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">Sugestões</span>
              </div>
              <div className="space-y-1">
                {analysis.questions.slice(0, 2).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="w-full text-left p-2 rounded bg-purple-900/30 border border-purple-700/30 hover:bg-purple-800/40 transition-colors"
                  >
                    <p className="text-xs text-purple-100 leading-relaxed">{question}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ações - Compacto */}
          {analysis.actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-300">Ações</span>
              </div>
              <div className="space-y-1">
                {analysis.actionItems.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded bg-green-900/30 border border-green-700/30">
                    <CheckCircleIcon className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-100 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Passos - Compacto */}
          {analysis.nextSteps && (
            <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">Próximos Passos</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {analysis.nextSteps}
              </p>
            </div>
          )}
          
          {/* Status */}
          <div className="text-center py-2">
            <p className="text-xs text-gray-500">
              {messages.length > 0 ? 
                `Analisando ${messages.length} mensagens` : 
                'Aguardando conversa...'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
