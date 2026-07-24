# ELSYARIF AI Workspace

ELSYARIF AI is an advanced multimodal AI workspace powered by Gemini models, Veo video generation, Lyria music composition, live voice conversation, text-to-speech, Google Workspace integration, and a fully featured user profile and authentication system.

## Features

- **Chat & Search**: Multi-model reasoning (Gemini 3.5 Flash, 3.1 Pro, Flash Lite) with Google Search grounding.
- **Live Voice**: Ultra-low-latency real-time bidirectional voice conversation with Gemini Live API.
- **Image & Vision**: High-fidelity image generation with aspect ratios and image analysis (vision).
- **Veo Video Studio**: Cinematic 16:9 and 9:16 video generation from text prompts.
- **Music & TTS**: AI music track generation with Lyria and high-quality voice synthesis.
- **Google Docs Workspace**: Connect with Google account to browse, create, and manage Google Docs.
- **Google Calendar**: View upcoming calendar events and schedule new events.
- **Google Slides**: Create and manage Google Slides presentations.
- **Gmail**: Read inbox messages and send emails directly through Gmail API.
- **User Profile & Authentication**: Complete user profile section (avatar upload, bio, interests), email/password auth, and Google / Apple sign-in options.
- **Vercel Ready**: Includes `vercel.json` configuration for seamless deployment on Vercel.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment on Vercel

This repository includes a `vercel.json` file configured for deploying both the frontend static build and the backend API / WebSocket server on Vercel.

Simply link your GitHub repository to Vercel and add your `GEMINI_API_KEY` in the Vercel project environment settings.

## License

Apache-2.0
