"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, MessageSquareIcon, UserIcon, BotIcon } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}

// Mock data for demonstration
const mockSessions: ChatSession[] = [
  {
    id: "1",
    title: "JavaScript Best Practices",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    model: "GPT-4",
    messages: [
      {
        id: "1-1",
        content: "What are some JavaScript best practices for 2024?",
        role: "user",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "1-2",
        content: "Here are some key JavaScript best practices for 2024:\n\n1. Use TypeScript for better type safety\n2. Embrace ES6+ features like async/await\n3. Use modern bundlers like Vite\n4. Implement proper error handling\n5. Follow clean code principles",
        role: "assistant",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
        model: "GPT-4",
      },
      {
        id: "1-3",
        content: "Can you explain more about TypeScript benefits?",
        role: "user",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
      },
      {
        id: "1-4",
        content: "TypeScript provides several key benefits:\n\n• **Type Safety**: Catches errors at compile time\n• **Better IDE Support**: Enhanced autocomplete and refactoring\n• **Self-documenting Code**: Types serve as documentation\n• **Easier Refactoring**: Safer large-scale code changes\n• **Better Collaboration**: Clear interfaces between team members",
        role: "assistant",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 90000),
        model: "GPT-4",
      },
    ],
  },
  {
    id: "2",
    title: "React Performance Tips",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    model: "Claude",
    messages: [
      {
        id: "2-1",
        content: "How can I optimize React app performance?",
        role: "user",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: "2-2",
        content: "Here are key React performance optimization strategies:\n\n1. **Memoization**: Use React.memo, useMemo, useCallback\n2. **Code Splitting**: Lazy load components with React.lazy\n3. **Virtual Scrolling**: For large lists\n4. **Bundle Analysis**: Use webpack-bundle-analyzer\n5. **Image Optimization**: Use next/image or similar\n6. **Avoid Unnecessary Re-renders**: Optimize state structure",
        role: "assistant",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45000),
        model: "Claude",
      },
    ],
  },
];

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>("1");
  const [showGuide, setShowGuide] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedMessageId(messageId);
      // Remove highlight after 2 seconds
      setTimeout(() => setSelectedMessageId(null), 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Visual Guide Panel */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        showGuide ? 'w-80' : 'w-0'
      } overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5" />
              Visual Guide
            </h2>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Session Selector */}
        <div className="p-4 border-b border-gray-100">
          <select
            value={currentSessionId}
            onChange={(e) => setCurrentSessionId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.title} ({session.model})
              </option>
            ))}
          </select>
        </div>

        {/* Conversation Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Conversation Flow
          </h3>
          
          {currentSession && (
            <div className="space-y-3">
              {currentSession.messages.map((message, index) => (
                <div
                  key={message.id}
                  className="relative cursor-pointer group"
                  onClick={() => scrollToMessage(message.id)}
                >
                  {/* Timeline line */}
                  {index < currentSession.messages.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                      message.role === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-green-500'
                    }`}>
                      {message.role === 'user' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : (
                        <BotIcon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          {message.role === 'user' ? 'You' : (message.model || 'AI')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-800">
                        {message.content.length > 60 
                          ? `${message.content.substring(0, 60)}...`
                          : message.content
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Info */}
        {currentSession && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Started: {formatDate(currentSession.createdAt)}</div>
              <div>Messages: {currentSession.messages.length}</div>
              <div>Model: {currentSession.model}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Show Visual Guide"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {currentSession?.title || "Chat"}
                </h1>
                <p className="text-sm text-gray-500">
                  Testing Visual Guide Feature • {currentSession?.model}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Demo Mode
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              id={`message-${message.id}`}
              className={`flex gap-4 transition-all duration-300 ${
                selectedMessageId === message.id 
                  ? 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 -m-2' 
                  : ''
              } ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <BotIcon className="w-4 h-4" />
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {message.role === 'user' ? 'You' : (message.model || 'AI')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message... (Demo mode - messages won't be sent)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This is a demo environment for testing the Visual Guide feature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
