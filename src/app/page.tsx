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
  ClockIcon
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

  // Analisar conversa automaticamente após mudanças
  useEffect(() => {
    if (messages.length > 0) {
      analyzeConversation();
    }
  }, [messages]);

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
      }
    } catch (error) {
      console.error('Erro ao analisar conversa:', error);
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
        throw new Error('Falha na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente novamente.",
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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Visual Guide Inteligente */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        showGuide ? 'w-96' : 'w-0'
      } overflow-hidden flex flex-col`}>
        
        {/* Header do Guide */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              Visual Guide
            </h2>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Análise automática da conversa
          </p>
        </div>

        {/* Conteúdo do Guide */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Resumo Geral */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4" />
              Resumo da Conversa
            </h3>
            <p className="text-sm text-blue-700">
              {analysis.summary}
            </p>
          </div>

          {/* Pontos Principais */}
          {analysis.keyPoints.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-yellow-500" />
                Pontos Principais
              </h3>
              <div className="space-y-2">
                {analysis.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded bg-yellow-50 border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tópicos Identificados */}
          {analysis.topics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-green-500" />
                Tópicos
              </h3>
              <div className="space-y-2">
                {analysis.topics.map((topic, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getImportanceColor(topic.importance)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{topic.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-white">
                        {topic.importance}
                      </span>
                    </div>
                    <p className="text-xs opacity-80">{topic.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itens de Ação */}
          {analysis.actionItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                Próximas Ações
              </h3>
              <div className="space-y-2">
                {analysis.actionItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded bg-green-50 border border-green-200">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perguntas Relevantes */}
          {analysis.questions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <HelpCircleIcon className="w-4 h-4 text-purple-500" />
                Perguntas Sugeridas
              </h3>
              <div className="space-y-2">
                {analysis.questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="w-full text-left p-2 rounded bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <p className="text-sm text-purple-700">{question}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Passos */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Próximos Passos
            </h3>
            <p className="text-sm text-gray-600">
              {analysis.nextSteps}
            </p>
          </div>

          {/* Indicador de Análise */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 justify-center py-4">
              <SparklesIcon className="w-4 h-4 animate-spin" />
              Analisando conversa...
            </div>
          )}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Mostrar Visual Guide"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  T3 Chat com Visual Guide
                </h1>
                <p className="text-sm text-gray-500">
                  Chat inteligente com análise automática • GPT-3.5 Turbo
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online
              </div>
            </div>
          </div>
        </header>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <BotIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Bem-vindo ao T3 Chat!
              </h2>
              <p className="text-gray-500 mb-4">
                Comece uma conversa e veja o Visual Guide em ação
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Como você pode me ajudar?",
                  "Explique conceitos de programação",
                  "Dicas de produtividade"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
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
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <BotIcon className="w-4 h-4" />
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {message.role === 'user' ? 'Você' : 'IA'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <BotIcon className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm ml-2">IA está digitando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Área de Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[50px] max-h-[200px]"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Chat inteligente com análise automática de conversa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
