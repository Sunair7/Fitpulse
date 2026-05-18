import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';
import { caloriesFromMacros } from '../lib/nutritionMath.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Flame, Dumbbell, Scale } from 'lucide-react';

export function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [daily, setDaily] = useState(null);
  const [recent, setRecent] = useState(null);
  const [todayEntries, setTodayEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unitsBusy, setUnitsBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [d, w, n] = await Promise.all([
          api(`/nutrition/daily?date=${today}`),
          api('/workouts?limit=1'),
          api('/nutrition'),
        ]);
        if (!cancelled) {
          setDaily(d);
          setRecent(w.workouts?.[0] ?? null);
          const entries = n.entries || [];
          setTodayEntries(entries.filter((e) => e.loggedAt?.slice(0, 10) === today).slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setDaily(null);
          setRecent(null);
          setTodayEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleUnits() {
    if (!user) return;
    setUnitsBusy(true);
    try {
      const next = user.preferences.units === 'kg' ? 'lbs' : 'kg';
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ preferences: { units: next } }),
      });
      await refreshUser();
    } finally {
      setUnitsBusy(false);
    }
  }

  const u = user?.preferences?.units ?? 'kg';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-400">
          Hello{user?.username ? ` @${user.username}` : ''} — here&apos;s your fitness snapshot.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-cyan-300/90">Daily macros</p>
              <p className="mt-0.5 text-xs text-slate-500">Energy shown from macros (P×4 + C×4 + F×9).</p>
              {loading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-3xl font-semibold tabular-nums text-white">
                    {Math.round(daily?.calories ?? 0)}{' '}
                    <span className="text-base font-normal text-slate-400">kcal</span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <MacroPill label="Protein" value={daily?.protein ?? 0} color="bg-violet-500" />
                    <MacroPill label="Carbs" value={daily?.carbs ?? 0} color="bg-cyan-500" />
                    <MacroPill label="Fats" value={daily?.fats ?? 0} color="bg-amber-400" />
                  </div>
                  {daily &&
                    daily.caloriesLogged != null &&
                    Math.round(daily.caloriesLogged) !== Math.round(daily.calories) &&
                    Math.round(daily.caloriesLogged) > 0 && (
                      <p className="mt-2 text-xs text-amber-300/90">
                        Logged kcal in DB ({Math.round(daily.caloriesLogged)}) differs from macro math — totals use
                        macros.
                      </p>
                    )}
                </>
              )}
            </div>
            <Flame className="h-10 w-10 text-orange-400/80" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/nutrition" className="text-sm font-medium text-cyan-300 hover:underline">
              Log a meal →
            </Link>
            <Link to="/analytics" className="text-sm font-medium text-slate-300 hover:underline">
              Nutrition analytics →
            </Link>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-medium text-slate-300">Units</p>
          <p className="mt-2 text-2xl font-semibold text-white">{u}</p>
          <button
            type="button"
            disabled={unitsBusy}
            onClick={() => void toggleUnits()}
            className="mt-4 w-full rounded-xl border border-white/15 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
          >
            {unitsBusy ? 'Saving…' : `Switch to ${u === 'kg' ? 'lbs' : 'kg'}`}
          </button>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-cyan-300" />
            <h2 className="font-semibold text-white">Recent workout</h2>
          </div>
          {loading ? (
            <Skeleton className="mt-4 h-16 w-full" />
          ) : recent ? (
            <div className="mt-3">
              <p className="text-lg text-white">{recent.title}</p>
              <p className="text-sm text-slate-400">
                {recent.category} · {(recent.tags || []).join(', ') || 'no tags'} ·{' '}
                {recent.exercises?.length ?? 0} exercises · {new Date(recent.createdAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No workouts yet.</p>
          )}
          <Link to="/workouts/log" className="mt-4 inline-block text-sm font-medium text-cyan-300 hover:underline">
            Log a session →
          </Link>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-violet-300" />
            <h2 className="font-semibold text-white">Today&apos;s meals</h2>
          </div>
          {loading ? (
            <Skeleton className="mt-4 h-16 w-full" />
          ) : todayEntries.length === 0 ? (
            <p className="mt-3 text-slate-400">No nutrition entries today.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {todayEntries.map((en) => {
                const kcal = caloriesFromMacros(en.protein, en.carbs, en.fats);
                return (
                  <li key={en._id} className="flex justify-between gap-2">
                    <span className="capitalize">{en.mealType}</span>
                    <span className="text-slate-400">{en.foodName || en.foodItems?.[0]?.name || 'Meal'}</span>
                    <span className="font-mono text-white">{kcal} kcal</span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link to="/nutrition" className="mt-4 inline-block text-sm font-medium text-cyan-300 hover:underline">
            Add food →
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

function MacroPill({ label, value, color }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-slate-200 ring-1 ring-white/10">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}: <span className="font-mono text-white">{value}g</span>
    </span>
  );
}
