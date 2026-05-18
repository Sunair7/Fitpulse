import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';

export function RemindersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', kind: 'workout', remindAt: '', note: '' });
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api('/reminders');
    setItems(data.reminders || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/reminders', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          kind: form.kind,
          note: form.note,
          remindAt: form.remindAt || new Date().toISOString(),
        }),
      });
      setForm({ title: '', kind: 'workout', remindAt: '', note: '' });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(r) {
    await api(`/reminders/${r._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !r.completed }),
    });
    await load();
  }

  async function remove(id) {
    if (!window.confirm('Delete reminder?')) return;
    await api(`/reminders/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reminders</h1>
        <p className="text-slate-400">Workout, meal, and goal reminders (stored server-side).</p>
      </div>
      <GlassCard solid>
        <form onSubmit={(e) => void create(e)} className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white sm:col-span-2"
          />
          <select
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          >
            <option value="workout">Workout</option>
            <option value="meal">Meal</option>
            <option value="goal">Goal</option>
            <option value="other">Other</option>
          </select>
          <input
            type="datetime-local"
            value={form.remindAt}
            onChange={(e) => setForm((f) => ({ ...f, remindAt: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
          <input
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white sm:col-span-2"
          />
          <Pressable type="submit" disabled={busy} className="rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 sm:col-span-2">
            {busy ? 'Saving…' : 'Add reminder'}
          </Pressable>
        </form>
      </GlassCard>
      <GlassCard>
        <h2 className="font-semibold text-white">Upcoming</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.length === 0 && <li className="text-slate-500">No reminders.</li>}
          {items.map((r) => (
            <li
              key={r._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/60 px-3 py-2 ring-1 ring-white/5"
            >
              <div>
                <div className={r.completed ? 'text-slate-500 line-through' : 'text-white'}>{r.title}</div>
                <div className="text-xs text-slate-500">
                  {new Date(r.remindAt).toLocaleString()} · {r.kind}
                </div>
              </div>
              <div className="flex gap-2">
                <Pressable
                  onClick={() => void toggleDone(r)}
                  className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200"
                >
                  {r.completed ? 'Undo' : 'Done'}
                </Pressable>
                <Pressable
                  onClick={() => void remove(r._id)}
                  className="rounded-lg border border-rose-500/30 px-2 py-1 text-xs text-rose-300"
                >
                  Delete
                </Pressable>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
