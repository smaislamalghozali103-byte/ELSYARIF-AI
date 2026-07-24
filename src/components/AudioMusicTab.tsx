import React, { useState } from 'react';
import { Music, Volume2, Sparkles, Wand2, Loader2, Play, Download } from 'lucide-react';

export const AudioMusicTab: React.FC = () => {
  const [subMode, setSubMode] = useState<'music' | 'tts'>('music');

  const [musicPrompt, setMusicPrompt] = useState('An upbeat electronic synthwave track with soaring melodies and driving rhythm');
  const [musicModel, setMusicModel] = useState('lyria-3-clip-preview');
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState('');

  const [ttsText, setTtsText] = useState('Welcome to Gemini Studio Elite! Experience the pinnacle of multimodal AI capabilities.');
  const [voiceName, setVoiceName] = useState('Kore');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim() || musicLoading) return;

    setMusicLoading(true);
    setMusicUrl(null);
    setLyrics('');

    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt, model: musicModel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate music');

      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setMusicUrl(url);
      setLyrics(data.lyrics || '');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error generating music');
    } finally {
      setMusicLoading(false);
    }
  };

  const handleGenerateTts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsText.trim() || ttsLoading) return;

    setTtsLoading(true);
    setTtsAudioUrl(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, voiceName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate speech');

      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setTtsAudioUrl(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error generating speech');
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">Music & Speech Studio</h2>
            <p className="text-xs text-slate-500">Generate music tracks with Lyria or high-quality voice synthesis with TTS</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSubMode('music')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subMode === 'music' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lyria Music
          </button>
          <button
            onClick={() => setSubMode('tts')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subMode === 'tts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Text to Speech (TTS)
          </button>
        </div>
      </div>

      {subMode === 'music' ? (
        <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleGenerateMusic} className="space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Music Prompt</label>
              <textarea
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lyria Model</label>
              <select
                value={musicModel}
                onChange={(e) => setMusicModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="lyria-3-clip-preview">Lyria Clip (Short clip up to 30s)</option>
                <option value="lyria-3-pro-preview">Lyria Pro (Full-length track)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={musicLoading || !musicPrompt.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {musicLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              <span>Generate Music Track</span>
            </button>
          </form>

          {/* Music Result */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            {musicLoading ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Composing music track with Lyria...</p>
              </div>
            ) : musicUrl ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 shadow-sm">
                  <Music className="w-8 h-8 animate-bounce" />
                </div>
                <audio src={musicUrl} controls className="w-full max-w-sm" />
                {lyrics && (
                  <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-40 overflow-y-auto">
                    <div className="font-bold text-indigo-600 mb-1">Generated Lyrics & Metadata:</div>
                    {lyrics}
                  </div>
                )}
                <a
                  href={musicUrl}
                  download="lyria-track.wav"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Track
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <Music className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-medium">Your generated music track will appear here.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TTS Studio */
        <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleGenerateTts} className="space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Text to Synthesize</label>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Voice Model</label>
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {voices.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={ttsLoading || !ttsText.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {ttsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
              <span>Synthesize Speech (TTS)</span>
            </button>
          </form>

          {/* TTS Result */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            {ttsLoading ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Synthesizing voice audio...</p>
              </div>
            ) : ttsAudioUrl ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 shadow-sm">
                  <Volume2 className="w-8 h-8 animate-pulse" />
                </div>
                <audio src={ttsAudioUrl} controls autoPlay className="w-full max-w-sm" />
                <a
                  href={ttsAudioUrl}
                  download="gemini-tts.wav"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Speech Audio
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <Volume2 className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-medium">Synthesized speech audio will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
