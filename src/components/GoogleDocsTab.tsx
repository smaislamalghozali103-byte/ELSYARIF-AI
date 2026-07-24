import React, { useState, useEffect } from 'react';
import { FileText, Plus, ExternalLink, RefreshCw, LogOut, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { GoogleDocItem } from '../types';

let auth: any = null;
let googleProvider: any = null;

try {
  // @ts-ignore
  const firebaseConfig = require('../../firebase-applet-config.json');
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/documents');
  googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
} catch (e) {
  // Firebase config not present yet
}

export const GoogleDocsTab: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [docs, setDocs] = useState<GoogleDocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccessToken(null);
        setDocs([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) {
      alert('Firebase Auth / Google Workspace is not yet configured for this applet. Please request Firebase setup if needed.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        fetchUserDocs(credential.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert('Failed to sign in with Google: ' + err.message);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    setUser(null);
    setAccessToken(null);
    setDocs([]);
  };

  const fetchUserDocs = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.files) {
        setDocs(data.files);
      }
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !accessToken || creating) return;

    setCreating(true);
    try {
      const res = await fetch("https://docs.googleapis.com/v1/documents", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newDocTitle.trim() })
      });
      const data = await res.json();
      if (data.documentId) {
        setNewDocTitle('');
        fetchUserDocs(accessToken);
      }
    } catch (err: any) {
      console.error('Error creating doc:', err);
      alert('Failed to create document: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">Google Docs Workspace Integration</h2>
            <p className="text-xs text-slate-500">Connect your Google account to browse, create, and manage your Google Docs</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-700 font-semibold">{user.displayName || user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
              <FileText className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Connect with Google Docs</h3>
              <p className="text-slate-600 text-sm">
                Sign in with your Google account to access your documents securely through the Google Workspace API.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-sm shadow-md hover:bg-slate-50 transition-all cursor-pointer"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleCreateDoc} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="New Google Doc Title..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={creating || !newDocTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Create Doc</span>
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Your Google Documents
                </h3>
                <button
                  onClick={() => accessToken && fetchUserDocs(accessToken)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Refresh Docs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-sm font-medium">Loading your Google Docs...</span>
                </div>
              ) : docs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docs.map((doc) => (
                    <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">{doc.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {doc.id}</span>
                        </div>
                      </div>
                      <a
                        href={`https://docs.google.com/document/d/${doc.id}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 transition-colors shrink-0"
                        title="Open in Google Docs"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">
                  No Google Docs found in your account. Create your first doc above!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
