"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  SendIcon, 
  BotIcon, 
  UserIcon, 
  SparklesIcon,
  LightbulbIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
  TrashIcon,
  MessageSquareIcon,
  ArrowUpIcon
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface KeyPoint {
  text: string;
  messageId: string;
  relevance: "high" | "medium" | "low";
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

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  analysis: ConversationAnalysis;
  keyPoints: KeyPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export default function FabotChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showChatList, setShowChatList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 💾 Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedChats = localStorage.getItem('fabot-chats');
    const savedCurrentChatId = localStorage.getItem('fabot-current-chat');
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          keyPoints: chat.keyPoints || [],
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
        
        if (savedCurrentChatId && parsedChats.find((c: Chat) => c.id === savedCurrentChatId)) {
          setCurrentChatId(savedCurrentChatId);
          const currentChat = parsedChats.find((c: Chat) => c.id === savedCurrentChatId);
          if (currentChat) {
            setMessages(currentChat.messages);
            setKeyPoints(currentChat.keyPoints || []);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar chats:', error);
      }
    }
  }, []);

  // 💾 Salvar dados no localStorage
  const saveToStorage = useCallback((updatedChats: Chat[], currentId: string | null) => {
    localStorage.setItem('fabot-chats', JSON.stringify(updatedChats));
    if (currentId) {
      localStorage.setItem('fabot-current-chat', currentId);
    } else {
      localStorage.removeItem('fabot-current-chat');
    }
  }, []);

  // 🆕 Criar novo chat
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      analysis: {
        keyPoints: [],
        topics: [],
        actionItems: [],
        questions: [],
        summary: "",
        nextSteps: ""
      },
      keyPoints: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);
    setKeyPoints([]);
    setShowChatList(false);
    saveToStorage(updatedChats, newChat.id);
    
    console.log('🆕 Novo chat criado:', newChat.name);
  };

  // 🔄 Trocar chat
  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setKeyPoints(chat.keyPoints || []);
      setShowChatList(false);
      saveToStorage(chats, chatId);
      console.log('🔄 Trocando para chat:', chat.name);
    }
  };

  // 🗑️ Deletar chat
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    
    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        const newCurrentChat = updatedChats[updatedChats.length - 1];
        setCurrentChatId(newCurrentChat.id);
        setMessages(newCurrentChat.messages);
        setKeyPoints(newCurrentChat.keyPoints || []);
        saveToStorage(updatedChats, newCurrentChat.id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
        setKeyPoints([]);
        saveToStorage(updatedChats, null);
      }
    } else {
      saveToStorage(updatedChats, currentChatId);
    }
    
    console.log('🗑️ Chat deletado');
  };

  // 📝 Atualizar chat atual
  const updateCurrentChat = useCallback((newMessages: Message[], newKeyPoints: KeyPoint[]) => {
    if (!currentChatId) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: newMessages,
          keyPoints: newKeyPoints,
          updatedAt: new Date(),
          name: newMessages.length > 0 && chat.name.startsWith('Chat') 
            ? newMessages[0].content.substring(0, 30) + '...'
            : chat.name
        };
      }
      return chat;
    });

    setChats(updatedChats);
    saveToStorage(updatedChats, currentChatId);
  }, [currentChatId, chats, saveToStorage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🎯 Scroll para mensagem específica
  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 Análise focada em key points
  const analyzeConversation = useCallback(async () => {
    if (messages.length === 0) {
      console.log('🚫 Nenhuma mensagem para analisar');
      return;
    }
    
    console.log('🔄 ANALISANDO KEY POINTS - Total de mensagens:', messages.length);
    setIsAnalyzing(true);
    
    try {
      const conversationText = messages
        .map((msg, index) => `[${index}] ${msg.role === 'user' ? 'Usuário' : 'IA'}: ${msg.content}`)
        .join('\n\n');

      const analysisPrompt = `
Analise esta conversa e extraia APENAS os pontos-chave mais importantes em tempo real.

Conversa:
${conversationText}

Retorne um JSON com esta estrutura:
{
  "keyPoints": [
    {
      "text": "Ponto principal identificado",
      "messageIndex": 0,
      "relevance": "high"
    }
  ]
}

REGRAS:
- Máximo 5 key points
- Foque nos insights mais importantes
- Identifique o índice da mensagem [0, 1, 2...] que gerou cada ponto
- Relevance: "high", "medium", "low"
- Seja específico e conciso
`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em extrair pontos-chave de conversas. Sempre retorne JSON válido.'
            },
            {
              role: 'user', 
              content: analysisPrompt
            }
          ]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Resposta raw da análise:', data.message);
        
        try {
          const analysisResult = JSON.parse(data.message);
          console.log('✅ ANÁLISE PARSEADA:', analysisResult);
          
          const newKeyPoints: KeyPoint[] = analysisResult.keyPoints?.map((kp: any) => ({
            text: kp.text,
            messageId: messages[kp.messageIndex]?.id || '',
            relevance: kp.relevance || 'medium'
          })) || [];

          console.log('🎯 KEY POINTS EXTRAÍDOS:', newKeyPoints);
          setKeyPoints(newKeyPoints);
          updateCurrentChat(messages, newKeyPoints);
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON:', parseError);
        }
      } else {
        console.error('❌ Erro na resposta da API:', response.status);
      }
    } catch (error) {
      console.error('💥 Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
      console.log('⏹️ Análise finalizada');
    }
  }, [messages, updateCurrentChat]);

  // 🚀 Trigger automático
  useEffect(() => {
    if (messages.length > 0) {
      // Delay para garantir que a mensagem foi renderizada
      setTimeout(() => {
        analyzeConversation();
      }, 1000);
    }
  }, [messages.length, analyzeConversation]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Se não há chat atual, criar um novo
    if (!currentChatId) {
      createNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    console.log('📤 ENVIANDO MENSAGEM:', userMessage.content);
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages.map(msg => ({
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
        console.log('📥 RESPOSTA RECEBIDA');
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
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

  const getCurrentChatName = () => {
    if (!currentChatId) return 'Novo Chat';
    const chat = chats.find(c => c.id === currentChatId);
    return chat?.name || 'Chat';
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'border-red-400/40 bg-red-500/10 text-red-200';
      case 'medium': return 'border-yellow-400/40 bg-yellow-500/10 text-yellow-200';
      case 'low': return 'border-blue-400/40 bg-blue-500/10 text-blue-200';
      default: return 'border-purple-400/40 bg-purple-500/10 text-purple-200';
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* CSS para highlight de mensagem */}
      <style jsx>{`
        .highlight-message {
          animation: highlight 2s ease-in-out;
          transform: scale(1.02);
        }
        
        @keyframes highlight {
          0%, 100% { 
            background-color: transparent; 
            transform: scale(1);
          }
          50% { 
            background-color: rgba(168, 85, 247, 0.2); 
            transform: scale(1.02);
          }
        }
      `}</style>
      
      {/* 🎨 Sidebar esquerda - estilo Libra */}
      <div className="w-16 bg-black/20 backdrop-blur-xl border-r border-purple-500/20 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={createNewChat}
            className="w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl flex items-center justify-center transition-colors"
            title="Novo Chat"
          >
            <PlusIcon className="w-5 h-5 text-purple-300" />
          </button>
          <button 
            onClick={() => setShowChatList(!showChatList)}
            className="w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl flex items-center justify-center transition-colors"
            title="Lista de Chats"
          >
            <MessageSquareIcon className="w-5 h-5 text-purple-300" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl flex items-center justify-center transition-colors"
            title="Configurações"
          >
            <SettingsIcon className="w-5 h-5 text-purple-300" />
          </button>
        </div>
      </div>

      {/* 📋 Lista de Chats */}
      {showChatList && (
        <div className="w-80 bg-black/30 backdrop-blur-xl border-r border-purple-500/20 flex flex-col">
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Seus Chats</h2>
              <button
                onClick={() => setShowChatList(false)}
                className="p-1 hover:bg-purple-700/50 rounded transition-colors"
              >
                <XIcon className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chats.length === 0 ? (
              <p className="text-purple-300/60 text-sm text-center py-8">
                Nenhum chat ainda.<br />
                Clique em + para criar seu primeiro chat!
              </p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-purple-600/30 border-purple-500/50'
                      : 'bg-purple-900/20 border-purple-500/20 hover:bg-purple-800/30'
                  }`}
                  onClick={() => switchChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium truncate">
                        {chat.name}
                      </h3>
                      <p className="text-purple-300/60 text-xs">
                        {chat.keyPoints?.length || 0} pontos-chave
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 hover:bg-red-500/30 rounded transition-colors"
                    >
                      <TrashIcon className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ⚙️ Painel de Configurações */}
      {showSettings && (
        <div className="w-80 bg-black/30 backdrop-blur-xl border-r border-purple-500/20 flex flex-col">
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Configurações</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-purple-700/50 rounded transition-colors"
              >
                <XIcon className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-white font-medium mb-2">Visual Guide</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGuide}
                  onChange={(e) => setShowGuide(e.target.checked)}
                  className="rounded"
                />
                <span className="text-purple-200 text-sm">Mostrar Key Points</span>
              </label>
            </div>

            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-white font-medium mb-2">Dados</h3>
              <div className="space-y-2">
                <p className="text-purple-200 text-sm">
                  Chats: {chats.length}
                </p>
                <p className="text-purple-200 text-sm">
                  Key Points: {chats.reduce((total, chat) => total + (chat.keyPoints?.length || 0), 0)}
                </p>
                <button
                  onClick={() => {
                    if (confirm('Limpar todos os dados?')) {
                      setChats([]);
                      setCurrentChatId(null);
                      setMessages([]);
                      setKeyPoints([]);
                      localStorage.removeItem('fabot-chats');
                      localStorage.removeItem('fabot-current-chat');
                    }
                  }}
                  className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors text-sm border border-red-500/30"
                >
                  Limpar dados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {getCurrentChatName()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg transition-colors text-sm border border-purple-500/30"
                >
                  Key Points
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
                {currentChatId ? 'Chat vazio' : 'Bem-vindo ao FABOT!'}
              </h2>
              <p className="text-purple-300/80 mb-8 max-w-md mx-auto">
                {currentChatId 
                  ? 'Este chat está vazio. Comece digitando uma mensagem!' 
                  : 'Conversas inteligentes com extração automática de pontos-chave.'
                }
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
              id={`message-${message.id}`}
              className={`flex gap-4 transition-all duration-300 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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

      {/* ✨ Key Points Guide - lado direito moderno */}
      {showGuide && (
        <div className="w-96 bg-black/20 backdrop-blur-xl border-l border-purple-500/20 flex flex-col">
          
          {/* Header moderno */}
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <LightbulbIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Key Points</h2>
                  <p className="text-xs text-purple-300/60">Pontos principais em tempo real</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 hover:bg-purple-700/30 rounded-lg transition-colors"
              >
                <XIcon className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </div>

          {/* Conteúdo dos Key Points */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Status */}
            <div className="mb-6 text-center">
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2 text-purple-300">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Analisando...</span>
                </div>
              ) : (
                <div className="text-purple-400/80 text-sm">
                  {keyPoints.length > 0 
                    ? `${keyPoints.length} ponto${keyPoints.length > 1 ? 's' : ''} identificado${keyPoints.length > 1 ? 's' : ''}`
                    : 'Aguardando conversa...'
                  }
                </div>
              )}
            </div>

            {/* Key Points List */}
            <div className="space-y-4">
              {keyPoints.length === 0 && !isAnalyzing ? (
                <div className="text-center py-12">
                  <LightbulbIcon className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
                  <p className="text-purple-300/60 text-sm">
                    Comece uma conversa para ver os pontos-chave aparecerrem automaticamente!
                  </p>
                </div>
              ) : (
                keyPoints.map((point, index) => (
                  <div
                    key={index}
                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getRelevanceColor(point.relevance)}`}
                    onClick={() => scrollToMessage(point.messageId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed font-medium">
                          {point.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm`}>
                            {point.relevance}
                          </span>
                          <ArrowUpIcon className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
