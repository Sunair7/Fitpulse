import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { applyTheme, setLocalThemeOverride } from '../lib/theme.js';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.emailNotifications !== false
  );
  const [reminderAlerts, setReminderAlerts] = useState(user?.preferences?.reminderAlerts !== false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(Boolean(user?.consent?.analyticsOptIn));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.preferences?.theme) setTheme(user.preferences.theme);
    setEmailNotifications(user?.preferences?.emailNotifications !== false);
    setReminderAlerts(user?.preferences?.reminderAlerts !== false);
    setAnalyticsOptIn(Boolean(user?.consent?.analyticsOptIn));
  }, [user]);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      setLocalThemeOverride(theme);
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          preferences: { theme, emailNotifications, reminderAlerts },
          consent: { analyticsOptIn },
        }),
      });
      await refreshUser();
      applyTheme(theme);
      setMsg('Settings saved.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-slate-400">Theme, notifications, units, and privacy-related preferences.</p>
      </div>
      <GlassCard solid>
        <form onSubmit={(e) => void save(e)} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Theme</label>
            <select
              value={theme}
              onChange={(e) => {
                const v = e.target.value;
                setTheme(v);
                setLocalThemeOverride(v);
                applyTheme(v);
              }}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
            Email / product notifications (in-app feed uses this preference as a signal)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={reminderAlerts} onChange={(e) => setReminderAlerts(e.target.checked)} />
            Reminder alerts
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={analyticsOptIn} onChange={(e) => setAnalyticsOptIn(e.target.checked)} />
            Analytics opt-in (mirrors registration consent)
          </label>
          {msg && <p className="text-sm text-cyan-300">{msg}</p>}
          <Pressable type="submit" disabled={busy} className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950">
            {busy ? 'Saving…' : 'Save settings'}
          </Pressable>
        </form>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-slate-400">
          Non-functional targets (99% uptime, backups, penetration tests, full WCAG audit) require DevOps / QA
          process outside this codebase. This app implements secure auth, per-user authorization, HTTPS in
          production, and privacy toggles as a baseline.
        </p>
      </GlassCard>
    </div>
  );
}
