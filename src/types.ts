export type ActiveTab = 'chat' | 'voice' | 'image' | 'video' | 'music' | 'docs' | 'calendar' | 'slides' | 'gmail' | 'profile';

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

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface GoogleSlideItem {
  id: string;
  title: string;
  presentationId?: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}


