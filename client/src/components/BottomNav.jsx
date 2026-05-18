import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Apple, LineChart, User } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/workouts', icon: Dumbbell, label: 'Train' },
  { to: '/nutrition', icon: Apple, label: 'Food' },
  { to: '/analytics', icon: LineChart, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Me' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 glass no-print md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-[3.25rem] flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] ${
                isActive ? 'text-cyan-300' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span layout className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="navdot"
                      className="absolute -inset-1 rounded-full bg-cyan-500/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 mx-auto h-5 w-5" strokeWidth={1.75} />
                </motion.span>
                <span className="relative z-10 font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
