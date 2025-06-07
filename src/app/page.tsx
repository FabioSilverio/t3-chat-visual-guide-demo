"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  XIcon,
  TrashIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronUpIcon
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

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  analysis: ConversationAnalysis;
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
  const [analysis, setAnalysis] = useState<ConversationAnalysis>({
    keyPoints: [],
    topics: [],
    actionItems: [],
    questions: [],
    summary: "",
    nextSteps: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisVersion, setAnalysisVersion] = useState(0);
  
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
            setAnalysis(currentChat.analysis);
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);
    setAnalysis(newChat.analysis);
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
      setAnalysis(chat.analysis);
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
        setAnalysis(newCurrentChat.analysis);
        saveToStorage(updatedChats, newCurrentChat.id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
        setAnalysis({
          keyPoints: [],
          topics: [],
          actionItems: [],
          questions: [],
          summary: "",
          nextSteps: ""
        });
        saveToStorage(updatedChats, null);
      }
    } else {
      saveToStorage(updatedChats, currentChatId);
    }
    
    console.log('🗑️ Chat deletado');
  };

  // 📝 Atualizar chat atual
  const updateCurrentChat = useCallback((newMessages: Message[], newAnalysis: ConversationAnalysis) => {
    if (!currentChatId) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: newMessages,
          analysis: newAnalysis,
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 Função de análise melhorada
  const analyzeConversation = useCallback(async () => {
    if (messages.length === 0) {
      console.log('🚫 Nenhuma mensagem para analisar');
      return;
    }
    
    console.log('🔄 INICIANDO ANÁLISE - Total de mensagens:', messages.length);
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const analysisResult = await response.json();
        console.log('✅ ANÁLISE RECEBIDA:', analysisResult);
        setAnalysis(analysisResult);
        setAnalysisVersion(prev => prev + 1);
        updateCurrentChat(messages, analysisResult);
        console.log('🎯 Visual Guide ATUALIZADO! Versão:', analysisVersion + 1);
      } else {
        console.error('❌ Erro na resposta da API:', response.status);
        const errorText = await response.text();
        console.error('📄 Detalhes do erro:', errorText);
      }
    } catch (error) {
      console.error('💥 Erro na requisição de análise:', error);
    } finally {
      setIsAnalyzing(false);
      console.log('⏹️ Análise finalizada');
    }
  }, [messages, analysisVersion, updateCurrentChat]);

  // 🚀 Trigger automático melhorado
  useEffect(() => {
    console.log('🔄 useEffect triggered - messages length:', messages.length);
    
    if (messages.length > 0) {
      console.log('⚡ Iniciando análise imediata...');
      analyzeConversation();
    }
  }, [messages.length, analyzeConversation]);

  // 🔄 Análise manual para debug
  const forceAnalyze = () => {
    console.log('🔧 Análise manual forçada');
    analyzeConversation();
  };

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
        console.log('📥 RESPOSTA RECEBIDA, adicionando aos messages...');
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

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
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
                        {chat.messages.length} mensagens
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
                <span className="text-purple-200 text-sm">Mostrar Visual Guide</span>
              </label>
            </div>

            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-white font-medium mb-2">Dados</h3>
              <div className="space-y-2">
                <p className="text-purple-200 text-sm">
                  Chats salvos: {chats.length}
                </p>
                <p className="text-purple-200 text-sm">
                  Mensagens totais: {chats.reduce((total, chat) => total + chat.messages.length, 0)}
                </p>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
                      setChats([]);
                      setCurrentChatId(null);
                      setMessages([]);
                      setAnalysis({
                        keyPoints: [],
                        topics: [],
                        actionItems: [],
                        questions: [],
                        summary: "",
                        nextSteps: ""
                      });
                      localStorage.removeItem('fabot-chats');
                      localStorage.removeItem('fabot-current-chat');
                    }
                  }}
                  className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors text-sm border border-red-500/30"
                >
                  Limpar todos os dados
                </button>
              </div>
            </div>

            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-white font-medium mb-2">Sobre o FABOT</h3>
              <p className="text-purple-200 text-sm mb-2">
                Versão 2.0 - Chat Multitasking
              </p>
              <p className="text-purple-300/60 text-xs">
                Powered by Groq API (Llama 3.1)<br />
                Visual Guide automático<br />
                Dados salvos localmente
              </p>
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
                {currentChatId ? 'Chat vazio' : 'Bem-vindo ao FABOT!'}
              </h2>
              <p className="text-purple-300/80 mb-8 max-w-md mx-auto">
                {currentChatId 
                  ? 'Este chat está vazio. Comece digitando uma mensagem!' 
                  : 'Seu assistente inteligente com análise automática de conversas. Comece digitando qualquer pergunta.'
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
              <div className="flex items-center gap-2">
                <button
                  onClick={forceAnalyze}
                  className="px-2 py-1 text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded transition-colors"
                  title="Forçar análise"
                >
                  🔄
                </button>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 hover:bg-purple-700/50 rounded transition-colors"
                >
                  <XIcon className="w-4 h-4 text-purple-300" />
                </button>
              </div>
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
                  <>
                    <span>{messages.length} mensagens analisadas</span>
                    <br />
                    <span className="text-xs text-purple-500">v{analysisVersion}</span>
                  </>
                ) : (
                  'Aguardando conversa...'
                )}
              </p>
            </div>

            {/* Debug Info */}
            {messages.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-600/30">
                <p className="text-xs text-gray-400">
                  🔍 Debug: {analysis.keyPoints.length} pontos, {analysis.questions.length} perguntas
                </p>
              </div>
            )}

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
                  <span className="text-xs text-yellow-500">({analysis.keyPoints.length})</span>
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
                  <span className="text-xs text-purple-500">({analysis.questions.length})</span>
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
                  <span className="text-xs text-green-500">({analysis.actionItems.length})</span>
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
