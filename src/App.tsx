/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatTab } from './components/ChatTab';
import { VoiceLiveTab } from './components/VoiceLiveTab';
import { ImageTab } from './components/ImageTab';
import { VideoTab } from './components/VideoTab';
import { AudioMusicTab } from './components/AudioMusicTab';
import { GoogleDocsTab } from './components/GoogleDocsTab';
import { GoogleCalendarTab } from './components/GoogleCalendarTab';
import { GoogleSlidesTab } from './components/GoogleSlidesTab';
import { GmailTab } from './components/GmailTab';
import { ProfileTab } from './components/ProfileTab';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('elsyarif_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Multimodal AI researcher and passionate developer exploring advanced generative models.',
      interests: ['Artificial Intelligence', 'React & TypeScript', 'Generative Video', 'Audio Synthesis']
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('elsyarif_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('elsyarif_user_profile');
    }
  }, [user]);

  const handleUpdateProfile = (updated: UserProfile) => {
    setUser(updated);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('chat');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'voice' && <VoiceLiveTab />}
        {activeTab === 'image' && <ImageTab />}
        {activeTab === 'video' && <VideoTab />}
        {activeTab === 'music' && <AudioMusicTab />}
        {activeTab === 'docs' && <GoogleDocsTab />}
        {activeTab === 'calendar' && <GoogleCalendarTab />}
        {activeTab === 'slides' && <GoogleSlidesTab />}
        {activeTab === 'gmail' && <GmailTab />}
        {activeTab === 'profile' && (
          <ProfileTab
            profile={user || { name: 'Guest', email: '', avatar: '', bio: '', interests: [] }}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(profile) => {
          setUser(profile);
          setActiveTab('profile');
        }}
      />
    </div>
  );
}

