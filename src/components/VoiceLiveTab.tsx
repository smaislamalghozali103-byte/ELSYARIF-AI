import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Volume2, Sparkles, Activity, AlertCircle } from 'lucide-react';

export const VoiceLiveTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Ready to connect to Gemini Live API');
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const pcmToBase64 = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = (outputCtx: AudioContext, base64Data: string) => {
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
      }

      const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);

      const currentTime = outputCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;
    } catch (e) {
      console.error('Error playing audio chunk:', e);
    }
  };

  const startSession = async () => {
    try {
      setStatusText('Connecting to Gemini Live API...');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        setIsListening(true);
        setStatusText('Live Voice Session Active. Speak into your microphone!');

        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextPlayTimeRef.current = outputAudioContextRef.current.currentTime;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const inputCtx = audioContextRef.current;
        const source = inputCtx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (!ws || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const base64Audio = pcmToBase64(inputData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.audio && outputAudioContextRef.current) {
            playAudioChunk(outputAudioContextRef.current, data.audio);
          }
          if (data.interrupted) {
            nextPlayTimeRef.current = outputAudioContextRef.current?.currentTime || 0;
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onclose = () => {
        stopSession();
        setStatusText('Session ended.');
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setStatusText('Connection error encountered.');
        stopSession();
      };
    } catch (err: any) {
      console.error('Failed to start voice session:', err);
      setStatusText(`Error: ${err.message || 'Microphone access denied or error connecting'}`);
      stopSession();
    }
  };

  const stopSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/25 mb-6 relative animate-pulse text-white">
          <Radio className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Gemini Live Voice Conversation</h2>
        <p className="text-slate-600 text-sm max-w-md mb-8">
          Experience ultra-low-latency, real-time bidirectional voice conversations powered by model <code className="text-indigo-600 font-mono font-semibold">gemini-3.1-flash-live-preview</code>.
        </p>

        {/* Visualizer / Status Card */}
        <div className={`w-72 h-72 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-500 relative mb-8 bg-white shadow-lg ${
          isConnected
            ? 'border-emerald-500 shadow-emerald-500/10'
            : 'border-slate-200 shadow-sm'
        }`}>
          {isConnected && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
          )}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-3 text-indigo-600 shadow-sm">
            {isConnected ? <Activity className="w-8 h-8 animate-pulse text-emerald-600" /> : <MicOff className="w-8 h-8 text-slate-400" />}
          </div>
          <p className="text-sm font-semibold text-slate-700 px-6">{statusText}</p>
        </div>

        {/* Control Button */}
        <div>
          {!isConnected ? (
            <button
              onClick={startSession}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 flex items-center gap-3 transition-all cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              Start Live Conversation
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-base shadow-lg shadow-rose-600/25 flex items-center gap-3 transition-all cursor-pointer"
            >
              <MicOff className="w-5 h-5" />
              Disconnect Live Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
