import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';

export function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await api('/support');
      setTickets(data.tickets || []);
    } catch {
      setTickets([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/support', {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
      });
      setSubject('');
      setMessage('');
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Support & feedback</h1>
        <p className="text-slate-400">Report issues or request help. Tickets are stored for your account.</p>
      </div>
      <GlassCard solid>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <input
            required
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
          <textarea
            required
            rows={5}
            placeholder="Describe the issue or feedback…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
          <Pressable type="submit" disabled={busy} className="w-full rounded-xl bg-violet-500 py-3 font-semibold text-white">
            {busy ? 'Sending…' : 'Submit ticket'}
          </Pressable>
        </form>
      </GlassCard>
      <GlassCard>
        <h2 className="font-semibold text-white">Your tickets</h2>
        {tickets.length === 0 ? (
          <p className="mt-2 text-slate-400">No tickets yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {tickets.map((t) => (
              <li key={t._id} className="rounded-xl bg-slate-900/60 px-3 py-2 ring-1 ring-white/5">
                <div className="font-medium text-white">{t.subject}</div>
                <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
                <div className="mt-1 text-slate-400">{t.message}</div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
