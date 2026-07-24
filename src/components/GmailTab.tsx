import React, { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, LogOut, Loader2, Inbox, AlertCircle } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { GmailMessageItem } from '../types';

let auth: any = null;
let googleProvider: any = null;

try {
  // @ts-ignore
  const firebaseConfig = require('../../firebase-applet-config.json');
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
} catch (e) {
  // Firebase config not present yet
}

export const GmailTab: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Compose state
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccessToken(null);
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) {
      alert('Firebase Auth / Gmail is not yet configured for this applet.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        fetchMessages(credential.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert('Failed to sign in with Google: ' + err.message);
    }
  };

  const handleLogout = async () => {
    if (auth) await auth.signOut();
    setUser(null);
    setAccessToken(null);
    setMessages([]);
  };

  const fetchMessages = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.messages) {
        const detailedMessages = await Promise.all(
          data.messages.map(async (msg: { id: string; threadId: string }) => {
            const detailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const subjectHeader = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
            const fromHeader = headers.find((h: any) => h.name === 'From')?.value || '(Unknown sender)';
            return {
              id: msg.id,
              threadId: msg.threadId,
              snippet: detail.snippet,
              subject: subjectHeader,
              from: fromHeader
            };
          })
        );
        setMessages(detailedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim() || !accessToken || sending) return;

    setSending(true);
    setSendSuccess(false);

    try {
      const rawMessage = [
        `To: ${to.trim()}`,
        `Subject: ${subject.trim()}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        ``,
        body.trim()
      ].join('\r\n');

      const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMessage })
      });
      const data = await res.json();
      if (data.id) {
        setTo('');
        setSubject('');
        setBody('');
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 4000);
        fetchMessages(accessToken);
      } else {
        throw new Error(data.error?.message || 'Failed to send email');
      }
    } catch (err: any) {
      console.error('Error sending email:', err);
      alert('Failed to send email: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">Gmail Integration</h2>
            <p className="text-xs text-slate-500">Read inbox messages and send emails directly through Gmail API</p>
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

      <div className="p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
              <Mail className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Connect Gmail</h3>
              <p className="text-slate-600 text-sm">
                Sign in with your Google account to access your Gmail inbox and send emails securely.
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
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compose Email */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" /> Compose & Send Email
              </h3>

              {sendSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  Email sent successfully via Gmail!
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">To</label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email Subject..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Message Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    placeholder="Write your email message here..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !to || !subject || !body}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send Email</span>
                </button>
              </form>
            </div>

            {/* Inbox Messages */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-indigo-600" /> Recent Inbox Messages
                </h3>
                <button
                  onClick={() => accessToken && fetchMessages(accessToken)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Refresh Inbox"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-1">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-sm font-medium">Loading Gmail messages...</span>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[220px]">{msg.from}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 mb-1">{msg.subject}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{msg.snippet}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs font-medium">
                    No messages found in your inbox.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
