import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  ArrowRight, 
  MessageSquareText, 
  CheckCircle2,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { chatbotService, ChatMessage, ChatAction } from '../../services/chatbotService';

interface ShramikChatbotProps {
  navigate: (route: string) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  sender: 'bot',
  text: `Hello! I am your **Shramik AI Assistant**.\n\nI can help you estimate daily wages, understand our **Zero-Data SMS dispatch** for workers, or help you post and find verified contractors in Goa.`,
  timestamp: 'Just now',
  actions: [
    { label: 'Post a Job', route: '/customer/create-work' },
    { label: 'Explore Quotes & Rates', route: '/quotes' },
    { label: 'How Platform Works', route: '/how-it-works' }
  ],
  suggestedQueries: [
    'How does SMS work without internet?',
    'What are painter wages in Mapusa?',
    'Find emergency plumbers in Porvorim',
    'How does the 2D matching engine work?'
  ]
};

export const ShramikChatbot: React.FC<ShramikChatbotProps> = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  };

  const handleClear = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText !== undefined ? overrideText : input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const botResponse = await chatbotService.sendMessage(textToSend, messages);
      setMessages(prev => [...prev, botResponse]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          text: 'I encountered an issue processing that. Please ask about wages, SMS dispatch, or verified workers!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ label: 'View Quotes', route: '/quotes' }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (action: ChatAction) => {
    navigate(action.route);
    // Optionally minimize on navigation for better UX
    setIsMinimized(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          className={`pointer-events-auto transition-all duration-300 ease-out origin-bottom-right mb-3 w-[92vw] sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col ${
            isMinimized ? 'h-14' : 'h-[570px] max-h-[82vh]'
          }`}
          style={{ boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-navy-800 select-none">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-navy-950 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-white tracking-tight">Shramik AI Assistant</h3>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-400/30">
                    2D Core
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online • Goa Gig & Wage Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              {!isMinimized && (
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body content if not minimized */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-slate-800 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-lg bg-navy-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div 
                          className={`p-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${
                            isUser 
                              ? 'bg-shramik-600 text-white rounded-br-none shadow-shramik-600/10' 
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                          }`}
                        >
                          {/* Formatted Text rendering */}
                          <div>{msg.text}</div>

                          {/* Action Navigation Buttons */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                              {msg.actions.map((act, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleActionClick(act)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 rounded-lg border border-slate-200 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                  <span>{act.label}</span>
                                  <ArrowRight className="w-3 h-3 text-amber-600" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-400 px-8">
                        {msg.timestamp}
                      </span>

                      {/* Suggested Chips from bot response */}
                      {!isUser && msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                        <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                          {msg.suggestedQueries.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(chip)}
                              className="text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-600 hover:text-navy-900 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300"
                            >
                              💡 {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 text-slate-400 pl-2">
                    <div className="w-6 h-6 rounded-lg bg-navy-900 text-amber-400 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200/80">
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about wages, SMS dispatch, or workers..."
                    className="w-full pr-12 pl-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="absolute right-1.5 p-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-slate-950 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>Powered by Gemini & Shramik 2D RAG</span>
                  <span>Enter ↵ to send</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Launcher Button */}
      <div className="pointer-events-auto relative group">
        {/* Glow halo */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-shramik-500 to-amber-500 opacity-70 blur-md group-hover:opacity-100 transition-all duration-300 animate-pulse" />

        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          aria-label="Open Shramik AI Assistant Chatbot"
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-navy-950 to-slate-900 text-white shadow-2xl border border-amber-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>

          <div className="text-left pr-1 hidden sm:block">
            <span className="block text-xs font-bold tracking-tight text-white font-display leading-tight">
              Shramik AI
            </span>
            <span className="block text-[10px] text-amber-400 font-medium">
              Ask Assistant
            </span>
          </div>

          {/* Unread notification indicator */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white text-[9px] font-bold text-white items-center justify-center">
                1
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
