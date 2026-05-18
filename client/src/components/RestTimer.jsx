import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.jsx';
import { Pressable } from './Skeleton.jsx';

export function RestTimer({ seconds, open, onClose, onComplete, label = 'Rest' }) {
  const [left, setLeft] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      firedRef.current = false;
      return;
    }
    setLeft(seconds);
    firedRef.current = false;
    const id = window.setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          if (!firedRef.current) {
            firedRef.current = true;
            queueMicrotask(() => onComplete?.());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, seconds, onComplete]);

  const m = Math.floor(Math.max(0, left) / 60);
  const s = Math.max(0, left) % 60;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 pb-24 sm:items-center sm:pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal
          aria-label="Rest timer"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="w-full max-w-sm"
          >
            <GlassCard solid className="text-center">
              <p className="text-sm uppercase tracking-widest text-cyan-300/90">{label}</p>
              <p className="mt-2 font-mono text-5xl font-semibold tabular-nums text-white">
                {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
              </p>
              <div className="mt-6 flex gap-3">
                <Pressable
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-600 py-3 text-slate-200"
                >
                  Skip
                </Pressable>
                <Pressable onClick={onClose} className="flex-1 rounded-xl bg-cyan-500 py-3 font-medium text-slate-950">
                  Done
                </Pressable>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
