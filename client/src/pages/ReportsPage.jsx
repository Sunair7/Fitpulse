import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api, downloadApi } from '../lib/api.js';

export function ReportsPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    void (async () => {
      try {
        const [w, n, g] = await Promise.all([
          api('/workouts?limit=5'),
          api('/nutrition?limit=5'),
          api('/goals'),
        ]);
        setSummary({ workouts: w.workouts || [], nutrition: n.entries || [], goals: g.goals || [] });
      } catch {
        setSummary(null);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports & export</h1>
          <p className="text-slate-400">CSV exports from the server and a print-friendly summary (save as PDF).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pressable
            onClick={() => void downloadApi('/export/workouts.csv', 'workouts.csv')}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white"
          >
            CSV workouts
          </Pressable>
          <Pressable
            onClick={() => void downloadApi('/export/nutrition.csv', 'nutrition.csv')}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white"
          >
            CSV nutrition
          </Pressable>
          <Pressable
            onClick={() => void downloadApi('/export/progress.csv', 'progress.csv')}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white"
          >
            CSV progress
          </Pressable>
          <Pressable
            onClick={() => window.print()}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Print / Save PDF
          </Pressable>
        </div>
      </div>

      <GlassCard className="print:block">
        <h1 className="text-xl font-bold text-white">FitPulse — progress report</h1>
        <p className="text-sm text-slate-400">Generated {new Date().toLocaleString()}</p>
        <section className="mt-6">
          <h2 className="font-semibold text-white">Recent workouts</h2>
          {!summary ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
              {summary.workouts.map((w) => (
                <li key={w._id}>
                  {w.title} — {w.category} — {new Date(w.createdAt).toLocaleDateString()}
                </li>
              ))}
              {summary.workouts.length === 0 && <li>No workouts</li>}
            </ul>
          )}
        </section>
        <section className="mt-6">
          <h2 className="font-semibold text-white">Recent nutrition</h2>
          {!summary ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
              {summary.nutrition.map((n) => (
                <li key={n._id}>
                  {n.mealType}: {n.foodName || 'Meal'} — {n.calories} kcal
                </li>
              ))}
              {summary.nutrition.length === 0 && <li>No nutrition</li>}
            </ul>
          )}
        </section>
        <section className="mt-6">
          <h2 className="font-semibold text-white">Goals</h2>
          {!summary ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
              {summary.goals.map((g) => (
                <li key={g._id}>
                  {g.title} — target {g.targetValue} {g.unit} {g.completed ? '(done)' : ''}
                </li>
              ))}
              {summary.goals.length === 0 && <li>No goals</li>}
            </ul>
          )}
        </section>
      </GlassCard>
    </div>
  );
}
