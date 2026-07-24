import React, { useState, useEffect } from 'react';
import { Video as VideoIcon, Sparkles, Wand2, Loader2, Play, Download, Film } from 'lucide-react';

export const VideoTab: React.FC = () => {
  const [prompt, setPrompt] = useState('A cinematic drone shot gliding over a bioluminescent alien forest at twilight');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!operationName || videoUrl) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/video/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });
        const data = await res.json();

        if (data.done) {
          clearInterval(interval);
          setStatusMsg('Video generation complete! Downloading video...');
          
          const downloadRes = await fetch('/api/video/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });

          if (!downloadRes.ok) throw new Error('Failed to download video stream');
          const blob = await downloadRes.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setLoading(false);
          setStatusMsg('');
        } else {
          setStatusMsg('Generating cinematic video with Veo 3... This can take up to a minute.');
        }
      } catch (err: any) {
        console.error(err);
        clearInterval(interval);
        setLoading(false);
        setStatusMsg(`Error: ${err.message || 'Video generation failed'}`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [operationName, videoUrl]);

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setVideoUrl(null);
    setOperationName(null);
    setStatusMsg('Submitting video generation request to Veo 3...');

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, resolution })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start video generation');

      setOperationName(data.operationName);
      setStatusMsg('Video generation in progress... Polling status.');
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center gap-3 shadow-sm">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <VideoIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-base text-slate-900">Veo 3 Cinematic Video Studio</h2>
          <p className="text-xs text-slate-500">Generate stunning 16:9 or 9:16 video clips from text prompts</p>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Controls */}
        <form onSubmit={handleGenerateVideo} className="space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Video Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the cinematic scene..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            <span>Generate Video (Veo 3)</span>
          </button>
        </form>

        {/* Video Preview / Output */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-slate-500 text-center px-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold text-slate-800">{statusMsg}</p>
              <p className="text-xs text-slate-400">Veo video generation is processing in the cloud. Please wait...</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg max-h-[350px] bg-slate-900">
                <video src={videoUrl} controls autoPlay loop className="max-h-[350px] w-auto object-contain" />
              </div>
              <a
                href={videoUrl}
                download="veo-ai-video.mp4"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Download Video
              </a>
            </div>
          ) : (
            <div className="text-center text-slate-400 space-y-2">
              <Film className="w-12 h-12 mx-auto opacity-40" />
              <p className="text-sm font-medium">Your generated cinematic video will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
