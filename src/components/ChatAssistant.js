import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';
import drillAvatarImg from '../assets/robot_drill_avatar.webp';
import { feedback, getSoundEnabled, setSoundEnabled } from '../lib/uxFeedback';

const DEFAULT_QUICK_QUESTIONS = [
  { id: 'nexus', question: "What makes a bulletproof nexus letter?" },
  { id: 'vamath', question: "How does VA math work?" },
  { id: 'cpexam', question: "How do I crush my C&P exam?" },
  { id: 'presumptive', question: "Am I eligible for presumptives?" },
  { id: 'denied', question: "My claim was denied. Now what?" },
];

const DEFAULT_GREETING = "Listen up, soldier! I'm Drill, your VA claims advisor. I've guided hundreds of veterans through this minefield, and I'm not about to let you get shortchanged. What's your mission today?";

const DrillAvatar = ({ size = 'md', showName = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-11 h-11',
    lg: 'w-14 h-14'
  };
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg border-2 border-[#1B3A5F] bg-slate-100`}>
        <img 
          src={drillAvatarImg} 
          alt="Drill - VA Claims Advisor" 
          className="w-full h-full object-cover scale-110"
        />
      </div>
      {showName && (
        <span className="text-[10px] font-bold text-[#1B3A5F] uppercase tracking-wider">Drill</span>
      )}
    </div>
  );
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: DEFAULT_GREETING
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [isAnimating, setIsAnimating] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState(DEFAULT_QUICK_QUESTIONS);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  const handleOpen = () => {
    feedback('open');
    setIsAnimating(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClose = () => {
    feedback('close');
    setIsOpen(false);
  };

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
    feedback('toggle');
  };

  useEffect(() => {
    checkAvailability();
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAvailability = async () => {
    try {
      const response = await api.get('/assistant/health');
      setIsAvailable(response.data.available);
      
      if (response.data.greeting) {
        setMessages([{ role: 'assistant', content: response.data.greeting }]);
      }
      if (response.data.quick_questions && response.data.quick_questions.length > 0) {
        setQuickQuestions(response.data.quick_questions);
      }
    } catch {
      setIsAvailable(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getContext = () => {
    return {
      current_page: location.pathname,
      timestamp: new Date().toISOString()
    };
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    feedback('submit');
    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const normalizedHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await api.post('/assistant/chat', {
        message: messageText,
        conversation_history: normalizedHistory,
        context: getContext()
      });

      if (response.data.success) {
        feedback('notification');
        const citations = response.data.citations || [];
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response,
          citations: citations.length > 0 ? citations : null
        }]);
      } else {
        feedback('error');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response || "Hit a snag, soldier. Regroup and try again."
        }]);
      }
    } catch (error) {
      feedback('error');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Comms are down. Stand by and retry in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickQuestion = (question) => {
    feedback('buttonPress');
    sendMessage(question);
  };

  if (!isAvailable) return null;
  
  // Hide on pitch deck and executive summary pages
  if (location.pathname === '/pitch-deck' || location.pathname === '/executive-summary') return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-gradient-to-br from-[#1B3A5F] to-[#0f2340] text-white p-2 md:p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-[#C41E3A]/60 group"
          aria-label="Open Drill - VA Claims Advisor"
        >
          <div className="relative">
            <DrillAvatar size="md" showName={false} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1B3A5F] animate-pulse" />
          </div>
          <span className="hidden md:inline text-sm font-bold pr-1 uppercase tracking-wide group-hover:tracking-wider transition-all">Ask Drill</span>
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[400px] md:max-w-[calc(100vw-3rem)] h-[100dvh] md:h-[550px] md:max-h-[calc(100vh-6rem)] bg-white md:rounded-xl shadow-2xl flex flex-col overflow-hidden md:border-2 border-[#1B3A5F] ${isAnimating ? 'animate-slideUp md:animate-scaleIn' : ''}`}>
          <div className="bg-gradient-to-r from-[#1B3A5F] to-[#0f2340] text-white px-4 py-3 flex items-center justify-between safe-area-top">
            <div className="flex items-center gap-3">
              <div className="relative">
                <DrillAvatar size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1B3A5F]" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide">DRILL</h3>
                <p className="text-xs text-sky-300 font-medium">VA Claims Advisor</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
              >
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-50" />}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
            <p className="text-xs text-amber-800 font-medium italic">
              "The VA rates what's DOCUMENTED, not what they think they know."
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <DrillAvatar size="sm" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm animate-slide-in ${
                    msg.role === 'user'
                      ? 'bg-[#1B3A5F] text-white'
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1">References:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.citations.slice(0, 3).map((cite, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-mono">
                            {cite.code || cite.reference || `38 CFR ${cite.section || ''}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  <DrillAvatar size="sm" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Drill is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Intel Requests:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuickQuestion(q.question || q.text)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#1B3A5F]/10 hover:bg-[#1B3A5F]/20 text-[#1B3A5F] font-medium transition-colors border border-[#1B3A5F]/20"
                  >
                    {q.question || q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white safe-area-bottom">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Report your question, soldier..."
                className="flex-1 px-3 py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A5F]/30 focus:border-[#1B3A5F]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2.5 bg-gradient-to-br from-[#1B3A5F] to-[#0f2340] text-white rounded-lg hover:from-[#2a4a6f] hover:to-[#1a3350] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        .safe-area-top { padding-top: env(safe-area-inset-top, 0); }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
      `}</style>
    </>
  );
}
