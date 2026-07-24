import React, { useState } from 'react';
import { User, Mail, Sparkles, Plus, X, Upload, Check, Camera, Edit3 } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onUpdateProfile, onLogout }) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [newInterest, setNewInterest] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim() || interests.includes(newInterest.trim())) return;
    setInterests([...interests, newInterest.trim()]);
    setNewInterest('');
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter(i => i !== item));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setAvatar(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name,
      email,
      avatar,
      bio,
      interests
    };
    onUpdateProfile(updated);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">User Profile & Preferences</h2>
            <p className="text-xs text-slate-500">Manage your workspace avatar, bio, and interests</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full">
        {savedMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile successfully updated and saved!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-indigo-50 shadow-md bg-slate-100">
                <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <label className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change Avatar</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mb-1">{name || 'User'}</h3>
            <p className="text-xs text-slate-500 mb-4">{email}</p>

            <div className="w-full border-t border-slate-100 pt-4 mt-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Workspace Status</span>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Session</span>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Edit Profile Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us a little about yourself..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Interests & Specialties</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {interests.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(item)}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add new interest (e.g., Quantum Computing)..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
