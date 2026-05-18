import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { api } from '../lib/api.js';
import { Pressable } from './Skeleton.jsx';

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    try {
      const data = await api('/notifications');
      setItems(data.notifications || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  async function markAll() {
    await api('/notifications/read-all', { method: 'POST' });
    await load();
  }

  async function markOne(id) {
    await api(`/notifications/${id}/read`, { method: 'PATCH' });
    await load();
  }

  return (
    <div className="relative">
      <Pressable
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-slate-200"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Pressable>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold text-white">Activity</span>
            <button
              type="button"
              className="text-xs text-cyan-300 hover:underline"
              onClick={() => void markAll()}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-72 space-y-1 overflow-auto">
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => void markOne(n._id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    n.read ? 'text-slate-400' : 'bg-white/5 text-white'
                  }`}
                >
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="text-xs text-slate-400">{n.body}</div>}
                  <div className="mt-1 text-[10px] text-slate-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
          <Link
            to="/reminders"
            className="mt-2 block rounded-xl px-3 py-2 text-center text-xs text-cyan-300 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Manage reminders →
          </Link>
        </div>
      )}
    </div>
  );
}
