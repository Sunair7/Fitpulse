import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatWeightKg, inputWeightToKg, weightKgToDisplay } from '../lib/units.js';

// Configuration for user suggestions
const SUGGESTIONS = {
  measurement: ['waist', 'bicep', 'chest', 'thigh', 'neck', 'hip'],
  performance: ['5k_run', 'bench_press_1rm', 'squat_1rm', 'deadlift_1rm', 'max_pushups', 'plank_hold'],
};

const UNIT_SUGGESTIONS = ['cm', 'kg', 'sec', 'min', 'reps', 'lbs', 'inches', 'km', 'miles'];


export function AnalyticsPage() {
  const { user } = useAuth();
  const units = user?.preferences?.units ?? 'kg';
  const [tab, setTab] = useState('weight');

  const [logs, setLogs] = useState([]);
  const [wf, setWf] = useState([]);
  const [nt, setNt] = useState([]);
  const [lift, setLift] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const [wVal, setWVal] = useState('');
  const [pMode, setPMode] = useState('measurement'); // 'measurement' | 'performance'
  const [pForm, setPForm] = useState({
    category: 'measurement',
    metricKey: '',
    value: '',
    unit: '',
    loggedAt: new Date().toISOString().slice(0, 10),
  });



  async function loadAll() {
    setLoading(true);
    try {
      const [wl, a1, a2, a3, pe] = await Promise.all([
        api('/weight-logs'),
        api('/analytics/workout-frequency?days=30'),
        api('/analytics/nutrition-trend?days=30'),
        api('/analytics/lifting-summary'),
        api('/progress'),
      ]);
      setLogs(wl.logs || []);
      setWf(a1.series || []);
      setNt(
        (a2.series || []).map((r) => ({
          date: r._id,
          calories: r.calories,
          protein: r.protein,
        }))
      );
      setLift(a3.points || []);
      setProgress(pe.entries || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function addWeight(e) {
    e.preventDefault();
    const n = Number(wVal);
    if (!n || n <= 0) return;
    await api('/weight-logs', {
      method: 'POST',
      body: JSON.stringify({ weightKg: inputWeightToKg(n, units) }),
    });
    setWVal('');
    await loadAll();
  }

  async function addProgress(e) {
    e.preventDefault();
    const n = Number(pForm.value);
    if (!pMode || !pForm.metricKey || !Number.isFinite(n)) return;

    await api('/progress', {
      method: 'POST',
      body: JSON.stringify({
        category: pForm.category,
        metricKey: pForm.metricKey.toLowerCase().trim().replace(/\s+/g, '_'),
        value: n,
        unit: pForm.unit.toLowerCase().trim(),
        loggedAt: pForm.loggedAt,
      }),
    });


    setPForm((f) => ({
      ...f,
      value: '',
      // keep the same loggedAt so quick logging feels natural
    }));
    await loadAll();
  }

  const chartWeight = (logs || []).map((l) => ({
    date: new Date(l.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: Number(weightKgToDisplay(l.weightKg, units).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-slate-400">Weight, workout frequency, nutrition trends, and custom progress.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['weight', 'workouts', 'nutrition', 'progress'].map((t) => (
          <Pressable
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm capitalize ${
              tab === t ? 'bg-cyan-500 text-slate-950' : 'border border-white/15 text-slate-200'
            }`}
          >
            {t}
          </Pressable>
        ))}
      </div>

      {loading && <p className="text-slate-400">Loading charts…</p>}

      {tab === 'weight' && (
        <>
          <GlassCard solid>
            <h2 className="font-semibold text-white">Log bodyweight</h2>
            <form onSubmit={(e) => void addWeight(e)} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder={`Weight (${units})`}
                value={wVal}
                onChange={(e) => setWVal(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
              <Pressable type="submit" className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950">
                Add
              </Pressable>
            </form>
          </GlassCard>
          <GlassCard className="min-h-[300px]">
            <h2 className="mb-4 font-semibold text-white">Weight trend</h2>
            {chartWeight.length === 0 ? (
              <p className="text-slate-400">Add weight entries to chart.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartWeight}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15,23,42,0.95)',
                        border: '1px solid rgba(148,163,184,0.2)',
                        borderRadius: 12,
                      }}
                      formatter={(val) => [`${val} ${units}`, 'Weight']}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </>
      )}

      {tab === 'workouts' && (
        <GlassCard className="min-h-[300px]">
          <h2 className="mb-4 font-semibold text-white">Workout frequency (30 days)</h2>
          {wf.length === 0 ? (
            <p className="text-slate-400">Log workouts to see frequency.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <h3 className="mt-8 font-semibold text-white">Recent strength peaks (max weight / exercise)</h3>
          {lift.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No strength workouts yet.</p>
          ) : (
            <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-sm text-slate-300">
              {lift.slice(0, 40).map((p, i) => (
                <li key={i}>
                  {p.date} — {p.exercise}: {p.maxWeight} {units}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      )}

      {tab === 'nutrition' && (
        <GlassCard className="min-h-[300px]">
          <h2 className="mb-4 font-semibold text-white">Calories & protein (30 days)</h2>
          {nt.length === 0 ? (
            <p className="text-slate-400">Log nutrition to see trends.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nt}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="protein" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      )}

      {tab === 'progress' && (
        <div className="space-y-6">
          <GlassCard solid>
            <h2 className="font-semibold text-white">Log Progress Entry</h2>

            {/* Category Toggle */}
            <div className="mt-4 flex gap-2 p-1 bg-slate-900 rounded-xl">
              {['measurement', 'performance'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setPMode(cat);
                    setPForm((f) => ({
                      ...f,
                      category: cat,
                      unit: cat === 'measurement' ? 'cm' : '',
                    }));
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    pMode === cat
                      ? 'bg-violet-500 text-white shadow-lg'
                      : 'bg-black text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <form onSubmit={addProgress} className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Metric Name with Datalist */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Metric Name</label>
                <input
                  list="metric-list"
                  placeholder={
                    pMode === 'measurement' ? 'e.g. Waist, Bicep' : 'e.g. 5k Run, Max Pullups'
                  }
                  value={pForm.metricKey}
                  onChange={(e) => setPForm((f) => ({ ...f, metricKey: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-violet-500 outline-none"
                />
                <datalist id="metric-list">
                  {SUGGESTIONS[pMode].map((s) => (
                    <option key={s} value={s.replace(/_/g, ' ')} />
                  ))}
                </datalist>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Date</label>
                <input
                  type="date"
                  value={pForm.loggedAt}
                  onChange={(e) => setPForm((f) => ({ ...f, loggedAt: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-violet-500 outline-none"
                />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Value</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={pForm.value}
                  onChange={(e) => setPForm((f) => ({ ...f, value: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-violet-500 outline-none"
                />
              </div>

              {/* Unit Customization */}
              <div className="sm:col-span-2 space-y-3">
                <label className="text-xs font-medium text-slate-400 ml-1">Unit</label>
                <div className="flex flex-wrap gap-2">
                  {UNIT_SUGGESTIONS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setPForm((f) => ({ ...f, unit: u }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        pForm.unit === u
                          ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type custom unit..."
                  value={pForm.unit}
                  onChange={(e) => setPForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-violet-500 outline-none"
                />
              </div>

              <Pressable
                type="submit"
                className="sm:col-span-2 rounded-xl bg-violet-600 py-4 font-bold text-white shadow-lg hover:bg-violet-500 transition-colors"
              >
                Save Progress Entry
              </Pressable>
            </form>
          </GlassCard>

          {/* History List */}
          <GlassCard>
            <h3 className="font-semibold text-white">Recent Entries</h3>
            {progress.length === 0 ? (
              <p className="mt-4 text-slate-500 text-sm italic">No entries yet. Start tracking to see history!</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Metric</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {progress.slice(0, 15).map((p) => (
                      <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-200 font-medium">
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded mr-2 uppercase">
                            {p.category[0]}
                          </span>
                          {p.metricKey.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 text-white font-mono">
                          {p.value} <span className="text-slate-500 text-xs">{p.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-right text-xs">
                          {new Date(p.loggedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {tab === 'weight' && logs.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white">History</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {[...logs]
              .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))
              .slice(0, 8)
              .map((l) => (
                <li key={l._id} className="flex justify-between border-b border-white/5 py-2">
                  <span>{new Date(l.loggedAt).toLocaleString()}</span>
                  <span className="font-mono text-white">{formatWeightKg(l.weightKg, units)}</span>
                </li>
              ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
