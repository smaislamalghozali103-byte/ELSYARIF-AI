export type ActiveTab = 'chat' | 'voice' | 'image' | 'video' | 'music' | 'docs' | 'profile';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  interests: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
}

export interface GoogleDocItem {
  id: string;
  title: string;
  mimeType: string;
  webViewLink?: string;
}

