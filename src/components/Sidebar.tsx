import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { MessageSquare, Mic, Image, Video, Music, FileText, Calendar, Presentation, Mail, Sparkles, User, LogIn } from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onOpenAuth }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'chat', label: 'Chat & Search', icon: <MessageSquare className="w-5 h-5" />, desc: 'Multi-model reasoning & grounding' },
    { id: 'voice', label: 'Live Voice', icon: <Mic className="w-5 h-5" />, desc: 'Real-time conversational audio' },
    { id: 'image', label: 'Image & Vision', icon: <Image className="w-5 h-5" />, desc: 'Aspect ratios & visual analysis' },
    { id: 'video', label: 'Veo Video', icon: <Video className="w-5 h-5" />, desc: 'AI cinematic video generation' },
    { id: 'music', label: 'Music & TTS', icon: <Music className="w-5 h-5" />, desc: 'Lyria tracks & speech synthesis' },
    { id: 'docs', label: 'Google Docs', icon: <FileText className="w-5 h-5" />, desc: 'Workspace Docs integration' },
    { id: 'calendar', label: 'Google Calendar', icon: <Calendar className="w-5 h-5" />, desc: 'Workspace Calendar events' },
    { id: 'slides', label: 'Google Slides', icon: <Presentation className="w-5 h-5" />, desc: 'Workspace Slides presentations' },
    { id: 'gmail', label: 'Gmail', icon: <Mail className="w-5 h-5" />, desc: 'Workspace Gmail inbox & send' },
    { id: 'profile', label: 'User Profile', icon: <User className="w-5 h-5" />, desc: 'Avatar, bio & interests' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-slate-900">
            ELSYARIF AI
          </h1>
          <p className="text-xs text-slate-500">Multimodal AI Workspace</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">{item.label}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        {user ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group"
          >
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-slate-900 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
};

