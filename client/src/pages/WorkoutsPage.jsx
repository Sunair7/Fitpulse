import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (category) qs.set('category', category);
      if (search.trim()) qs.set('search', search.trim());
      qs.set('limit', '50');
      const data = await api(`/workouts?${qs.toString()}`);
      setWorkouts(data.workouts || []);
    } catch {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [category]);

  async function remove(id) {
    if (!window.confirm('Delete this workout?')) return;
    await api(`/workouts/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Workouts</h1>
          <p className="text-slate-400">Create, edit, delete, filter by category.</p>
        </div>
        <Link
          to="/workouts/log"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="h-4 w-4" />
          New workout
        </Link>
      </div>

      <GlassCard className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void load()}
          placeholder="Search title, notes, tags…"
          className="min-w-[12rem] flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
        >
          <option value="">All categories</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="hybrid">Hybrid</option>
          <option value="mobility">Mobility</option>
          <option value="other">Other</option>
        </select>
        <Pressable onClick={() => void load()} className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white">
          Apply
        </Pressable>
      </GlassCard>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : workouts.length === 0 ? (
        <GlassCard>
          <p className="text-slate-300">No workouts found.</p>
          <Link to="/workouts/log" className="mt-3 inline-block text-cyan-300 hover:underline">
            Start your first session →
          </Link>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => (
            <li key={w._id}>
              <GlassCard className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{w.title}</p>
                  <p className="text-sm text-slate-400">
                    {w.category} · {(w.tags || []).join(', ') || 'no tags'} ·{' '}
                    {w.exercises?.length ?? 0} exercises · {new Date(w.createdAt).toLocaleString()}
                    {w.completedAt && <span className="text-emerald-400/90"> · Completed</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/workouts/${w._id}/edit`}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <Pressable
                    onClick={() => void remove(w._id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Pressable>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
