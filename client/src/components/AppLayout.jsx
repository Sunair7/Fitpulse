import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Apple,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  LogOut,
  Menu,
  PlusSquare,
  Search,
  Settings,
  Target,
  User,
  Bell,
  X,
} from 'lucide-react';
import { BottomNav } from './BottomNav.jsx';
import { NotificationMenu } from './NotificationMenu.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SIDEBAR_KEY = 'fp_sidebar_collapsed';

function NavItem({ to, end, icon: Icon, label, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/30'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

function NavGroup({ title, collapsed, children }) {
  if (collapsed) return <div className="space-y-1">{children}</div>;
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const closeMobile = () => setMobileOpen(false);

  const sidebarInner = (
    <>
      <div className={`flex items-center gap-2 border-b border-white/10 px-3 py-4 ${collapsed ? 'justify-center' : ''}`}>
        <span className="text-lg font-bold tracking-tight text-white">FitPulse</span>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-4">
        <NavGroup title="Overview" collapsed={collapsed}>
          <NavItem to="/" end icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} onNavigate={closeMobile} />
        </NavGroup>
        <NavGroup title="Logs" collapsed={collapsed}>
          <NavItem to="/workouts" icon={Dumbbell} label="Workouts" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/workouts/log" icon={PlusSquare} label="Log workout" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/nutrition" icon={Apple} label="Nutrition" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/analytics" icon={LineChart} label="Analytics" collapsed={collapsed} onNavigate={closeMobile} />
        </NavGroup>
        <NavGroup title="Planning" collapsed={collapsed}>
          <NavItem to="/goals" icon={Target} label="Goals" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/reminders" icon={Bell} label="Reminders" collapsed={collapsed} onNavigate={closeMobile} />
        </NavGroup>
        <NavGroup title="More" collapsed={collapsed}>
          <NavItem to="/search" icon={Search} label="Search" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/reports" icon={FileText} label="Reports" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/profile" icon={User} label="Profile" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} onNavigate={closeMobile} />
          <NavItem to="/support" icon={LifeBuoy} label="Support" collapsed={collapsed} onNavigate={closeMobile} />
        </NavGroup>
      </nav>
      <div className="hidden border-t border-white/10 p-2 md:block">
        <button
          type="button"
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  const asideClass = `glass no-print hidden shrink-0 flex-col border-r border-white/10 md:flex ${
    collapsed ? 'w-[4.5rem]' : 'w-60'
  }`;

  return (
    <div className="flex min-h-dvh">
      <aside className={asideClass}>{sidebarInner}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-end border-b border-white/10 p-2">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarInner}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur md:bg-slate-950/60 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex rounded-xl border border-white/15 p-2 text-slate-200 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-white md:hidden">FitPulse</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationMenu />
            <span className="hidden max-w-[10rem] truncate text-sm text-slate-400 sm:inline">
              @{user?.username || user?.name}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
