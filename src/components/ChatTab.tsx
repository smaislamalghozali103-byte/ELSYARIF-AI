import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, Globe, Cpu, Zap, Sparkles, Loader2, ExternalLink } from 'lucide-react';

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Gemini Elite AI collaborator. How can I help you today? You can choose models, enable Google Search grounding, or explore our media and workspace tools.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gemini-3.5-flash');
  const [systemInstruction, setSystemInstruction] = useState('You are an expert AI collaborator.');
  const [enableSearch, setEnableSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          systemInstruction,
          enableSearch
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'No response generated.',
        timestamp: new Date(),
        groundingChunks: data.groundingChunks
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${err.message || 'Something went wrong.'}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Header / Control Bar */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">AI Intelligence & Search Hub</h2>
            <p className="text-xs text-slate-500">Powered by Gemini 3.x models with web grounding</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (General)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex/Coding)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Low-latency)</option>
            </select>
          </div>

          {/* Search Grounding Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
              enableSearch
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            Google Search Grounding
          </button>
        </div>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${isUser ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-200'}`}>
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-2xl rounded-2xl p-5 shadow-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>

                {/* Grounding Sources */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" /> Sources & References:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, idx) => {
                        if (!chunk.web?.uri) return null;
                        return (
                          <a
                            key={idx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-indigo-600 border border-slate-200 transition-colors truncate max-w-xs font-medium"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className={`text-[10px] mt-2 font-medium opacity-60 ${isUser ? 'text-indigo-100 text-right' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-slate-600 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Gemini is thinking and searching...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-6 bg-white border-t border-slate-200 shadow-sm">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Collaborate with Gemini, ask questions, or request code..."
            className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-inner"
          />
          <div className="absolute right-3 flex gap-2">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Gemini can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
};
