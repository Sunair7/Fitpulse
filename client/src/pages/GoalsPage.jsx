import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';
import { goalProgressPercent } from '../lib/goalProgress.js';

export function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'strength',
    targetValue: '',
    startValue: '',
    currentValue: '',
    unit: '',
  });
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api('/goals');
      setGoals(data.goals || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          targetValue: Number(form.targetValue),
          startValue: form.startValue === '' ? 0 : Number(form.startValue),
          currentValue:
            form.currentValue === ''
              ? form.startValue === ''
                ? 0
                : Number(form.startValue)
              : Number(form.currentValue),
          unit: form.unit,
        }),
      });
      setForm({
        title: '',
        category: 'strength',
        targetValue: '',
        startValue: '',
        currentValue: '',
        unit: '',
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function patchGoal(id, body) {
    await api(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Goals</h1>
        <p className="text-slate-400">Targets with progress and completion notifications.</p>
      </div>

      <GlassCard solid>
        <h2 className="font-semibold text-white">New goal</h2>
        <form onSubmit={(e) => void create(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white sm:col-span-2"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          >
            <option value="strength">Strength</option>
            <option value="weight">Weight change</option>
            <option value="body">Body</option>
          </select>
          <input
            required
            placeholder="Target value"
            type="number"
            value={form.targetValue}
            onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
          <input
            placeholder="Start value"
            type="number"
            value={form.startValue}
            onChange={(e) => setForm((f) => ({ ...f, startValue: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
          <input
            placeholder="Current value"
            type="number"
            value={form.currentValue}
            onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
          <input
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white sm:col-span-2"
          />
          <Pressable
            type="submit"
            disabled={busy}
            className="rounded-xl bg-violet-500 py-3 font-semibold text-white sm:col-span-2 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Add goal'}
          </Pressable>
        </form>
      </GlassCard>

      <div className="space-y-3">
        {loading ? (
          <GlassCard>
            <p className="text-slate-400">Loading goals…</p>
          </GlassCard>
        ) : goals.length === 0 ? (
          <GlassCard>
            <p className="text-slate-400">No goals yet.</p>
          </GlassCard>
        ) : (
          goals.map((g) => {
            const pct = goalProgressPercent(g);
            return (
              <GlassCard key={g._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{g.title}</p>
                    <p className="text-sm text-slate-400 capitalize">
                      {g.category} · target {g.targetValue} {g.unit}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={g.completed}
                      onChange={(e) => void patchGoal(g._id, { completed: e.target.checked })}
                    />
                    Done
                  </label>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900 ring-1 ring-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">{Math.round(pct)}% toward target</p>
                <Pressable
                  onClick={() =>
                    setUpdateModal({
                      id: g._id,
                      title: g.title,
                      unit: g.unit,
                      value: String(g.currentValue ?? ''),
                    })
                  }
                  className="mt-3 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200"
                >
                  Update current
                </Pressable>
              </GlassCard>
            );
          })
        )}
      </div>

      {updateModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="presentation"
            onClick={() => setUpdateModal(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
            <GlassCard solid className="w-full max-w-md border border-white/15 p-6 shadow-2xl">
              <div role="dialog" aria-modal="true" aria-labelledby="goal-update-title">
              <h2 id="goal-update-title" className="text-lg font-semibold text-white">
                Update progress
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                New current value for <span className="text-slate-200">{updateModal.title}</span>
                {updateModal.unit ? (
                  <>
                    {' '}
                    (<span className="font-mono">{updateModal.unit}</span>)
                  </>
                ) : null}
              </p>
              <input
                type="number"
                step="any"
                autoFocus
                value={updateModal.value}
                onChange={(e) => setUpdateModal((m) => (m ? { ...m, value: e.target.value } : m))}
                className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-lg text-white outline-none ring-violet-500/30 focus:ring-2"
              />
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Pressable
                  type="button"
                  onClick={() => setUpdateModal(null)}
                  className="rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
                >
                  Cancel
                </Pressable>
                <Pressable
                  type="button"
                  onClick={() => {
                    const n = Number(updateModal.value);
                    if (!Number.isFinite(n)) return;
                    void patchGoal(updateModal.id, { currentValue: n }).then(() => setUpdateModal(null));
                  }}
                  className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-400"
                >
                  Save
                </Pressable>
              </div>
              </div>
            </GlassCard>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
