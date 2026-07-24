import React, { useState, useEffect } from 'react';
import { Settings, Key, Check, ShieldCheck, Eye, EyeOff, Save, Cpu, Sparkles } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedGemini = localStorage.getItem('elsyarif_gemini_api_key') || '';
    const storedGroq = localStorage.getItem('elsyarif_groq_api_key') || '';
    setGeminiKey(storedGemini);
    setGroqKey(storedGroq);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('elsyarif_gemini_api_key', geminiKey.trim());
    localStorage.setItem('elsyarif_groq_api_key', groqKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">API Key Configuration</h2>
            <p className="text-xs text-slate-500">Configure your personal Gemini and Groq API keys securely in your browser</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-3xl mx-auto w-full">
        {saved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-sm animate-fade-in">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>API keys saved successfully to local storage!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Gemini API Key */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Gemini API Key</h3>
                <p className="text-xs text-slate-500">Used for Google Gemini models, chat reasoning, multimodal vision, and search grounding.</p>
              </div>
            </div>

            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 pr-12 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showGemini ? 'Hide key' : 'Show key'}
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Get your free Gemini API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Google AI Studio</a>.
            </p>
          </div>

          {/* Groq API Key */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Groq API Key</h3>
                <p className="text-xs text-slate-500">Used for lightning-fast Llama & Mixtral inference on Groq hardware.</p>
              </div>
            </div>

            <div className="relative">
              <input
                type={showGroq ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 pr-12 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showGroq ? 'Hide key' : 'Show key'}
              >
                {showGroq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Get your Groq API key from <a href="https://console.groq.com/" target="_blank" rel="noreferrer" className="text-purple-600 underline">Groq Console</a>.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save API Keys</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
