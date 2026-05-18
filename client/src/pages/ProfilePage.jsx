import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, uploadImage } from '../lib/api.js';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [publicProfile, setPublicProfile] = useState(Boolean(user?.privacy?.publicProfile));
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setUsername(user.username || '');
    setProfilePicture(user.profilePicture || '');
    setPublicProfile(Boolean(user.privacy?.publicProfile));
  }, [user]);

  async function onPickAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadBusy(true);
    setMsg('');
    try {
      const data = await uploadImage('/upload/avatar', 'image', file);
      if (data.url) {
        setProfilePicture(data.url);
        setMsg('Photo uploaded — click Save profile to keep it on your account.');
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          username: username.trim().toLowerCase(),
          profilePicture,
          privacy: { publicProfile },
        }),
      });
      await refreshUser();
      setMsg('Profile updated.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-slate-400">Your public card and discoverability settings.</p>
      </div>
      <GlassCard solid>
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10">
            {profilePicture ? (
              <img src={profilePicture} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-slate-500">
                {(user?.name || '?').slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.name}</p>
            <p className="text-slate-400">@{user?.username}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={(e) => void save(e)} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Pressable
              type="button"
              disabled={uploadBusy}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              {uploadBusy ? 'Uploading…' : 'Upload photo (Cloudinary)'}
            </Pressable>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onPickAvatar(e)} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Or paste image URL</label>
            <input
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={publicProfile}
              onChange={(e) => setPublicProfile(e.target.checked)}
            />
            Allow others to find my profile in user search
          </label>
          {msg && <p className="text-sm text-cyan-300">{msg}</p>}
          <Pressable type="submit" disabled={busy} className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950">
            {busy ? 'Saving…' : 'Save profile'}
          </Pressable>
        </form>
      </GlassCard>
    </div>
  );
}
