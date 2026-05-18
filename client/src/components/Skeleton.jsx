import { motion } from 'framer-motion';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-800/60 skeleton-shimmer ${className}`}
      aria-hidden
    />
  );
}

export function Pressable({ children, className = '', ...props }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
