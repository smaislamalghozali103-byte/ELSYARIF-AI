import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiKeyConfigured: !!apiKey });
});

// 1. Chat & Intelligence API (supports Flash, Pro, Lite, Search Grounding)
app.post("/api/chat", async (req, res) => {
  try {
    const { model = "gemini-3.5-flash", messages, systemInstruction, enableSearch = false } = req.body;
    
    // Convert messages to contents or use prompt
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({ text, groundingChunks });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. Image Generation API (supports gemini-3.1-flash-image, gemini-3.1-flash-lite-image, aspect ratios)
app.post("/api/image/generate", async (req, res) => {
  try {
    const { prompt, model = "gemini-3.1-flash-lite-image", aspectRatio = "1:1", imageSize = "1K", enableSearch = false } = req.body;

    const config: any = {
      imageConfig: {
        aspectRatio,
        imageSize
      }
    };

    if (enableSearch && model === "gemini-3.1-flash-image") {
      config.tools = [{ googleSearch: { searchTypes: { webSearch: {}, imageSearch: {} } } }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config
    });

    let imageUrl = null;
    let responseText = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    res.json({ imageUrl, text: responseText });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// 3. Image Analysis (Vision) API using gemini-3.1-pro-preview
app.post("/api/image/analyze", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = "image/jpeg" } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: prompt || "Analyze this image in detail and provide key insights, objects, and observations." }
        ]
      }
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Image analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

// 4. Video Generation (Veo 3) Start API
app.post("/api/video/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", resolution = "720p", startImageBase64, startImageMime = "image/jpeg" } = req.body;

    const payload: any = {
      model: "veo-3.1-fast-generate-preview",
      prompt,
      config: {
        numberOfVideos: 1,
        resolution,
        aspectRatio
      }
    };

    if (startImageBase64) {
      payload.image = {
        imageBytes: startImageBase64,
        mimeType: startImageMime
      };
    }

    const operation = await ai.models.generateVideos(payload);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Video generation start error:", error);
    res.status(500).json({ error: error.message || "Failed to start video generation" });
  }
});

// Video Status Poll API
app.post("/api/video/status", async (req, res) => {
  try {
    const { operationName } = req.body;
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done, error: updated.error });
  } catch (error: any) {
    console.error("Video status check error:", error);
    res.status(500).json({ error: error.message || "Failed to check video status" });
  }
});

// Video Download API
app.post("/api/video/download", async (req, res) => {
  try {
    const { operationName } = req.body;
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: "Video URI not found" });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(500).json({ error: "Failed to download video asset from storage" });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const buffer = Buffer.from(await videoRes.arrayBuffer());
    res.send(buffer);
  } catch (error: any) {
    console.error("Video download error:", error);
    res.status(500).json({ error: error.message || "Failed to download video" });
  }
});

// 5. Music Generation API (Lyria)
app.post("/api/music/generate", async (req, res) => {
  try {
    const { prompt, model = "lyria-3-clip-preview" } = req.body;

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: prompt || "Generate an uplifting cinematic electronic track.",
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    res.json({ audioBase64, mimeType, lyrics });
  } catch (error: any) {
    console.error("Music generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate music" });
  }
});

// 6. Text-to-Speech API (TTS)
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text || "Hello from Gemini Studio!" }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio generated" });
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message || "Failed to generate speech" });
  }
});

// 7. WebSocket Server for Live Voice API (gemini-3.1-flash-live-preview)
wss.on("connection", async (clientWs, req) => {
  console.log("Client connected to Live API WebSocket");
  let liveSession: any = null;

  try {
    liveSession = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: "You are Gemini, an elite, warm, and highly capable personal AI collaborator.",
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          console.log("Gemini Live session closed");
        },
        onerror: (err: any) => {
          console.error("Gemini Live session error:", err);
        }
      },
    });
  } catch (err) {
    console.error("Failed to connect to Gemini Live:", err);
    clientWs.close();
    return;
  }

  clientWs.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.audio && liveSession) {
        liveSession.sendRealtimeInput({
          audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
        });
      }
    } catch (e) {
      console.error("Error processing client websocket message:", e);
    }
  });

  clientWs.on("close", () => {
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {}
    }
    console.log("Client disconnected from Live API WebSocket");
  });
});

async function startServer() {
  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemini Studio Elite server running on http://localhost:${PORT}`);
  });
}

startServer();
