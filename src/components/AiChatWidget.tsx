import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, Sparkles, RefreshCw, Trash2, ArrowDown, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import mascotImg from "../assets/images/dayly_mascot_1783408474403.jpg";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: Date;
}

interface AiChatWidgetProps {
  token: string;
  language: "id" | "en";
}

export default function AiChatWidget({ token, language }: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested initial prompts in Indonesian/English
  const suggestions = language === "id" 
    ? [
        "Bagaimana cara menyeimbangkan aktivitas hari ini?",
        "Berikan rekomendasi olahraga singkat di sela kerja.",
        "Buat rencana prioritas dari aktivitas saya.",
        "Beri saya motivasi penyemangat hari ini!"
      ]
    : [
        "How to balance today's activities?",
        "Recommend a short exercise between work.",
        "Create a priority plan for my activities.",
        "Give me some positive motivation for today!"
      ];

  // Load welcome message when chat is opened first time
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = language === "id"
        ? "Halo! Saya adalah Dayly, sahabat produktif dan sehatmu. Saya di sini untuk membantumu menyusun tugas, memberikan tips kebugaran, menjaga streak, atau sekadar berbagi motivasi positif agar harimu menyenangkan!\n\nAda yang ingin kita obrolkan hari ini? 😊"
        : "Hello! I'm Dayly, your healthy productivity companion. I'm here to help you organize tasks, recommend wellness tips, keep up your streak, or just share positive motivation to brighten your day!\n\nWhat would you like to talk about today? 😊";
      
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: welcomeText,
          createdAt: new Date(),
        },
      ]);
    }
  }, [language]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Alert user of new messages if widget is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const handleOpenWidget = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      role: "user",
      text: textToSend,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build session context to send to API
      // Only send the last 10 messages to keep request payload clean
      const apiMessages = [...messages, userMessage]
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-" + Math.random().toString(36).substr(2, 9),
            role: "assistant",
            text: data.reply,
            createdAt: new Date(),
          },
        ]);
      } else {
        throw new Error(data.message || "Gagal menghubungi asisten AI.");
      }
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-err-" + Math.random().toString(36).substr(2, 9),
          role: "assistant",
          text: language === "id"
            ? "Maaf, terjadi masalah koneksi ke asisten AI. Silakan coba kirim kembali pesan Anda."
            : "Sorry, there was a connection issue with the AI assistant. Please try sending your message again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm(language === "id" ? "Hapus riwayat chat?" : "Clear chat history?")) {
      const welcomeText = language === "id"
        ? "Halo! Saya adalah Asisten AI Dayly. Ada yang bisa saya bantu kembali?"
        : "Hello! I am your Dayly AI Assistant. How can I help you today?";
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: welcomeText,
          createdAt: new Date(),
        },
      ]);
    }
  };

  // Helper parser to render bold text and bullet/numbered lists safely
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedMessage = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check if bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-800 dark:text-slate-200 py-0.5">
            {parseBoldText(content)}
          </li>
        );
      }
      // Check if numbered list
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const content = numMatch[2];
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-slate-800 dark:text-slate-200 py-0.5">
            {parseBoldText(content)}
          </li>
        );
      }
      // Empty line
      if (line.trim() === "") return <div key={idx} className="h-1.5" />;
      // Default line
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-0.5">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  return (
    <div id="ai-chat-floating-container" className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            id="ai-chat-window-panel"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-emerald-100/40 dark:border-slate-800/80 rounded-3xl shadow-2xl w-[90vw] sm:w-[380px] h-[500px] flex flex-col overflow-hidden mb-4 transition-colors"
          >
            {/* Window Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-950 dark:to-teal-950 px-4 py-3 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white border border-white/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                  <img src={mascotImg} alt="Mascot" className="w-full h-full object-cover animate-pulse-slow" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black tracking-wide font-display">Sahabat Dayly</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
                    <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest leading-none">
                      {language === "id" ? "Siap Menemani" : "Active Now"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  id="clear-chat-history-btn"
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title={language === "id" ? "Hapus Chat" : "Clear Chat"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  id="close-chat-widget-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title={language === "id" ? "Tutup" : "Close"}
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Chat Conversation Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm border ${
                      m.role === "user"
                        ? "bg-emerald-600 border-emerald-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-900 border-slate-200/40 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {m.role === "user" ? (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="space-y-1.5 whitespace-pre-wrap">
                        {renderFormattedMessage(m.text)}
                      </div>
                    )}
                    <span
                      className={`text-[9px] block mt-1 text-right ${
                        m.role === "user" ? "text-emerald-200" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts Drawer */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 space-y-1.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                  {language === "id" ? "Saran Pertanyaan:" : "Suggested Questions:"}
                </span>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      id={`suggested-prompt-btn-${i}`}
                      onClick={() => handleSendMessage(s)}
                      className="text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/40 transition-all cursor-pointer truncate"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              id="ai-chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                id="ai-chat-text-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === "id" ? "Tanyakan sesuatu..." : "Ask me anything..."}
                disabled={isLoading}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-colors placeholder-slate-400"
              />
              <button
                id="ai-chat-submit-btn"
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-2.5 rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer ${
                  inputValue.trim() && !isLoading
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main floating trigger button */}
      <motion.button
        id="ai-chat-trigger-bubble-btn"
        onClick={isOpen ? () => setIsOpen(false) : handleOpenWidget}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer relative transition-all border ${
          isOpen
            ? "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
            : "bg-gradient-to-tr from-emerald-600 via-emerald-600 to-teal-500 border-emerald-500 text-white hover:from-emerald-700 hover:to-teal-600 shadow-emerald-600/20"
        }`}
        title="Asisten AI Dayly"
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1.5 -right-2 animate-bounce" />
          </div>
        )}

        {/* Unread dot indicator */}
        {hasNewMessage && !isOpen && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
