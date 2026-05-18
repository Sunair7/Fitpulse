export function GlassCard({ children, className = '', solid = false }) {
  return (
    <div className={`rounded-2xl p-4 ${solid ? 'glass-solid' : 'glass'} ${className}`}>
      {children}
    </div>
  );
}
