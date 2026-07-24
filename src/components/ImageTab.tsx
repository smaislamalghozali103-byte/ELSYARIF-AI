import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Wand2, Search, Upload, ScanLine, Loader2, Download } from 'lucide-react';

export const ImageTab: React.FC = () => {
  const [subMode, setSubMode] = useState<'generate' | 'analyze'>('generate');
  
  // Generation state
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gemini-3.1-flash-lite-image');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [enableSearch, setEnableSearch] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genText, setGenText] = useState('');

  // Analysis state
  const [analysisPrompt, setAnalysisPrompt] = useState('Analyze this image in detail and describe what you observe.');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const aspectRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || genLoading) return;

    setGenLoading(true);
    setGeneratedImage(null);
    setGenText('');

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, aspectRatio, imageSize, enableSearch })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');

      setGeneratedImage(data.imageUrl);
      setGenText(data.text);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error generating image');
    } finally {
      setGenLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setSelectedImage({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || analysisLoading) return;

    setAnalysisLoading(true);
    setAnalysisResult('');

    try {
      const res = await fetch('/api/image/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analysisPrompt,
          imageBase64: selectedImage.base64,
          mimeType: selectedImage.mimeType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze image');
      setAnalysisResult(data.text);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error analyzing image');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      {/* Header & Sub-mode toggle */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">Image Studio & Vision</h2>
            <p className="text-xs text-slate-500">Create high fidelity images with precise aspect ratios or analyze photos</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSubMode('generate')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subMode === 'generate' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Generate Images
          </button>
          <button
            onClick={() => setSubMode('analyze')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subMode === 'analyze' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analyze Image (Vision)
          </button>
        </div>
      </div>

      {subMode === 'generate' ? (
        <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Form */}
          <form onSubmit={handleGenerate} className="space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Image Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cybernetic tiger prowling through a neon-lit cyberpunk metropolis..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="gemini-3.1-flash-lite-image">Flash Lite Image (Fast)</option>
                  <option value="gemini-3.1-flash-image">Flash Image (High Quality)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Image Size</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="512px">512px</option>
                  <option value="1K">1K</option>
                  <option value="2K">2K</option>
                  <option value="4K">4K</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    type="button"
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="searchGrounding"
                checked={enableSearch}
                onChange={(e) => setEnableSearch(e.target.checked)}
                className="rounded bg-slate-50 border-slate-300 text-indigo-600 focus:ring-0"
              />
              <label htmlFor="searchGrounding" className="text-xs text-slate-700 font-medium">
                Enable Google Search grounding context (Flash Image only)
              </label>
            </div>

            <button
              type="submit"
              disabled={genLoading || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {genLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              <span>Generate Image</span>
            </button>
          </form>

          {/* Generated Result Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            {genLoading ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Synthesizing image with aspect ratio {aspectRatio}...</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg max-h-[350px] bg-slate-100">
                  <img src={generatedImage} alt="Generated AI" className="w-full h-auto object-contain max-h-[350px]" />
                </div>
                {genText && <p className="text-xs text-slate-600 text-center">{genText}</p>}
                <a
                  href={generatedImage}
                  download="gemini-elite-image.png"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download Image
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-medium">Your generated image will appear here.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Image Analysis / Vision */
        <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleAnalyze} className="space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Upload Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer relative bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {selectedImage ? (
                  <div className="text-emerald-700 text-xs font-semibold flex items-center justify-center gap-2">
                    <ScanLine className="w-4 h-4" /> Image selected successfully
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">Click or drag photo here to upload for AI vision analysis</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Analysis Question / Prompt</label>
              <textarea
                value={analysisPrompt}
                onChange={(e) => setAnalysisPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={analysisLoading || !selectedImage}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {analysisLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanLine className="w-5 h-5" />}
              <span>Analyze Image with Gemini 3.1 Pro</span>
            </button>
          </form>

          {/* Analysis Results */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-start">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Analysis Report
            </h3>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-y-auto min-h-[300px]">
              {analysisLoading ? (
                <div className="flex items-center justify-center h-full gap-3 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-sm font-medium">Examining image details...</span>
                </div>
              ) : analysisResult ? (
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{analysisResult}</div>
              ) : (
                <p className="text-slate-400 text-xs text-center mt-20 font-medium">Upload an image and run analysis to see insights here.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
