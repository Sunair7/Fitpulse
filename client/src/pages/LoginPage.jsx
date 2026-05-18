import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassCard>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in with your username or email.</p>
          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400" htmlFor="identifier">
                Username or email
              </label>
              <input
                id="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <motion.button
              type="submit"
              disabled={busy}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 py-3 font-semibold text-slate-950 disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            New here?{' '}
            <Link className="text-cyan-300 hover:underline" to="/register">
              Create account
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
