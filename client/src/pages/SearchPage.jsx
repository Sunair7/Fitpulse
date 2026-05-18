import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';

export function SearchPage() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(e) {
    e?.preventDefault();
    setBusy(true);
    try {
      const data = await api(`/search?q=${encodeURIComponent(q)}`);
      setRes(data);
    } catch {
      setRes({ workouts: [], nutrition: [], users: [] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Search</h1>
        <p className="text-slate-400">Find workouts, nutrition entries, and public profiles.</p>
      </div>
      <GlassCard className="flex flex-wrap gap-2">
        <form onSubmit={(e) => void run(e)} className="flex flex-1 flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type at least 2 characters…"
            className="min-w-[12rem] flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
          />
          <Pressable type="submit" disabled={busy} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
            {busy ? 'Searching…' : 'Search'}
          </Pressable>
        </form>
      </GlassCard>

      {res && (
        <div className="grid gap-4 lg:grid-cols-3">
          <GlassCard>
            <h2 className="font-semibold text-white">Workouts</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(res.workouts || []).map((w) => (
                <li key={w._id}>
                  <Link to={`/workouts/${w._id}/edit`} className="text-cyan-300 hover:underline">
                    {w.title}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {w.category} · {(w.tags || []).join(', ')}
                  </div>
                </li>
              ))}
              {(res.workouts || []).length === 0 && <li className="text-slate-500">No matches</li>}
            </ul>
          </GlassCard>
          <GlassCard>
            <h2 className="font-semibold text-white">Nutrition</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(res.nutrition || []).map((n) => (
                <li key={n._id}>
                  <span className="text-white">{n.foodName || 'Meal'}</span>
                  <div className="text-xs text-slate-500 capitalize">{n.mealType}</div>
                </li>
              ))}
              {(res.nutrition || []).length === 0 && <li className="text-slate-500">No matches</li>}
            </ul>
          </GlassCard>
          <GlassCard>
            <h2 className="font-semibold text-white">Users (public)</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(res.users || []).map((u) => (
                <li key={u.id} className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-800">
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="text-white">@{u.username}</div>
                    <div className="text-xs text-slate-500">{u.name}</div>
                  </div>
                </li>
              ))}
              {(res.users || []).length === 0 && <li className="text-slate-500">No matches</li>}
            </ul>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
