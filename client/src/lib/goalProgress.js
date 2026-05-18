export function goalProgressPercent(g) {
  const start = g.startValue ?? 0;
  const current = g.currentValue ?? start;
  const target = g.targetValue;

  if (g.category === 'weight' && target < start) {
    const span = start - target;
    if (span <= 0) return current <= target ? 100 : 0;
    const moved = start - current;
    return Math.min(100, Math.max(0, (moved / span) * 100));
  }

  const span = target - start;
  if (span === 0) return current >= target ? 100 : 0;
  const moved = current - start;
  return Math.min(100, Math.max(0, (moved / span) * 100));
}
