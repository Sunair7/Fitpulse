import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function RegisterPage() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!termsAccepted) {
      setError('Please accept the terms to continue.');
      return;
    }
    setBusy(true);
    try {
      await register({
        username: username.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim(),
        password,
        profilePicture: profilePicture.trim(),
        consent: { termsAccepted, analyticsOptIn },
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassCard>
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Unique username, secure password, basic profile.</p>
          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
                title="Letters, numbers, underscore"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                required
                minLength={6}
              />
            </div>
            {/* <div>
              <label className="text-xs font-medium text-slate-400" htmlFor="avatar">
                Profile picture URL (optional)
              </label>
              <input
                id="avatar"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="https://…"
              />
            </div> */}
            <label className="flex items-start gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span>I agree to the Terms and consent to data processing (GDPR-style control in Settings).</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={analyticsOptIn}
                onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                className="mt-1"
              />
              <span>Optional: allow anonymized analytics to improve the product.</span>
            </label>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <motion.button
              type="submit"
              disabled={busy}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3 font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create account'}
            </motion.button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link className="text-cyan-300 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
