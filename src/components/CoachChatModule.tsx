import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, UserProfile } from '../types';
import { Sparkles, Send, Bot, User, RefreshCw, AlertCircle, Heart, Loader2 } from 'lucide-react';

interface CoachChatModuleProps {
  userProfile: UserProfile;
}

export default function CoachChatModule({ userProfile }: CoachChatModuleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Hello, ${userProfile.displayName || 'friend'}. I am your supportive AI Wellness & Resilience Coach. 🌸 

I'm here to offer gentle journaling prompts, mindful breathing concepts, and motivational support. While I can help you reflect on emotional habits, please remember that I am not a clinical therapist or counselor and cannot provide diagnostic advice or treatment.

How are you navigating your internal energy and stress levels today? Let\'s talk.`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Coach failed to respond. Please check internet connections.');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'assistant',
        text: data.text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear this dialogue history? Your clinical reflections and coaching parameters will remain safe inside your profile.")) {
      setMessages([
        {
          id: 'init',
          sender: 'assistant',
          text: `Hello again, ${userProfile.displayName || 'friend'}. Ready to refocus on mindful self-care. What is on your mind today?`,
          timestamp: Date.now()
        }
      ]);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-[580px] bg-white/5 border border-white/10 rounded-3xl shadow-xl overflow-hidden relative">
      
      {/* Top Banner */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md text-white border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-400/15 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">AI Wellness & Habit Coach</h4>
            <span className="text-[10px] text-slate-400">Reflective Supportive Partner • Non-Diagnostic</span>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-xs font-semibold text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          Reset Chat
        </button>
      </div>

      {/* Message Output Frame */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-950/40">
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`p-2 rounded-full shrink-0 flex items-center justify-center h-8 w-8 ${
                  isBot ? 'bg-emerald-400/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  isBot
                    ? 'bg-white/5 border border-white/10 text-slate-200 shadow-md'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-medium shadow-md'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%] mr-auto"
            >
              <div className="p-2 rounded-full bg-emerald-400/10 border border-emerald-500/20 text-emerald-400 h-8 w-8 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl shadow-sm text-xs text-slate-400 animate-pulse">
                Coach is listening and reflecting...
              </div>
            </motion.div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/60 backdrop-blur-md border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={inputText}
          required
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., I'm feeling slightly stressed about work. Any simple grounding tasks?"
          className="flex-1 px-4 py-3 border border-white/10 rounded-2xl text-xs md:text-sm text-white bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-slate-950 transition-all"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-2xl shadow-md flex items-center justify-center cursor-pointer disabled:bg-white/5 disabled:text-slate-650 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>

      {/* Safety Compliance notice */}
      <div className="px-4 py-2 bg-slate-950 text-[10px] text-slate-500 border-t border-white/10 flex items-center gap-1">
        <Heart className="w-3 h-3 text-emerald-400" />
        <span>Strict HIPAA boundaries. Coaching does not constitute medical emergency support.</span>
      </div>

    </div>
  );
}
