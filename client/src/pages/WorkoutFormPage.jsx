import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { RestTimer } from '../components/RestTimer.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultSetsForType(type, units) {
  if (type === 'duration') return [{ durationSeconds: 60, completed: false }];
  if (type === 'bodyweight') return [{ reps: 10, weight: 0, completed: false }];
  return [{ reps: 8, weight: units === 'kg' ? 20 : 45, completed: false }];
}

export function WorkoutFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const units = user?.preferences?.units ?? 'kg';

  const [title, setTitle] = useState('Training');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('strength');
  const [tagsInput, setTagsInput] = useState('');
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [restOpen, setRestOpen] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const exercisesRef = useRef(exercises);
  exercisesRef.current = exercises;

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const data = await api(`/workouts/${id}`);
        const w = data.workout;
        if (cancelled || !w) return;
        setTitle(w.title || 'Workout');
        setNotes(w.notes || '');
        setCategory(w.category || 'strength');
        setTagsInput((w.tags || []).join(', '));
        setExercises(
          (w.exercises || []).map((ex) => ({
            clientId: uid(),
            name: ex.name,
            type: ex.type === 'duration' ? 'duration' : ex.type === 'bodyweight' ? 'bodyweight' : 'weight',
            restSeconds: ex.restSeconds ?? 90,
            sets: (ex.sets || []).map((s) => ({
              reps: s.reps,
              weight: s.weight,
              durationSeconds: s.durationSeconds,
              completed: Boolean(s.completed),
            })),
          }))
        );
      } catch {
        navigate('/workouts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  const addExercise = useCallback(() => {
    setExercises((prev) => [
      ...prev,
      {
        clientId: uid(),
        name: '',
        type: 'weight',
        restSeconds: 90,
        sets: defaultSetsForType('weight', units),
      },
    ]);
  }, [units]);

  const tags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsInput]
  );

  const payloadExercises = useMemo(
    () =>
      exercises.map((e) => ({
        name: e.name.trim() || 'Exercise',
        type: e.type === 'duration' ? 'duration' : e.type === 'bodyweight' ? 'bodyweight' : 'weight',
        restSeconds: e.restSeconds,
        sets: e.sets.map((s) =>
          e.type === 'duration'
            ? {
                durationSeconds: Number(s.durationSeconds) || 0,
                completed: s.completed,
              }
            : {
                reps: Number(s.reps) || 0,
                weight: Number(s.weight) || 0,
                completed: s.completed,
              }
        ),
      })),
    [exercises]
  );

  async function save(markComplete) {
    setSaving(true);
    try {
      const body = {
        title,
        notes,
        category,
        tags,
        exercises: payloadExercises,
        completedAt: markComplete ? new Date().toISOString() : undefined,
      };
      if (isEdit) {
        await api(`/workouts/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await api('/workouts', { method: 'POST', body: JSON.stringify(body) });
      }
      navigate('/workouts');
    } finally {
      setSaving(false);
    }
  }

  function updateExercise(cid, patch) {
    setExercises((prev) => prev.map((e) => (e.clientId === cid ? { ...e, ...patch } : e)));
  }

  function addSet(exId) {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.clientId !== exId) return e;
        const last = e.sets[e.sets.length - 1];
        let next;
        if (e.type === 'duration') {
          next = { durationSeconds: last?.durationSeconds ?? 60, completed: false };
        } else if (e.type === 'bodyweight') {
          next = { reps: last?.reps ?? 10, weight: last?.weight ?? 0, completed: false };
        } else {
          next = { reps: last?.reps ?? 8, weight: last?.weight ?? (units === 'kg' ? 20 : 45), completed: false };
        }
        return { ...e, sets: [...e.sets, next] };
      })
    );
  }

  function removeSet(exId, setIdx) {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.clientId !== exId) return e;
        const sets = e.sets.filter((_, i) => i !== setIdx);
        return { ...e, sets: sets.length ? sets : e.sets };
      })
    );
  }

  function toggleSetComplete(exId, setIdx) {
    const ex = exercisesRef.current.find((x) => x.clientId === exId);
    if (!ex) return;
    const wasIncomplete = !ex.sets[setIdx]?.completed;
    const hasMoreAfter = ex.sets.some((s, i) => i > setIdx && !s.completed);
    const shouldStartRest = wasIncomplete && hasMoreAfter && ex.restSeconds > 0;
    const rest = ex.restSeconds;

    setExercises((prev) =>
      prev.map((e) => {
        if (e.clientId !== exId) return e;
        const sets = e.sets.map((s, i) => (i === setIdx ? { ...s, completed: !s.completed } : s));
        return { ...e, sets };
      })
    );

    if (shouldStartRest) {
      queueMicrotask(() => {
        setRestSeconds(rest);
        setRestOpen(true);
      });
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading workout…</p>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{isEdit ? 'Edit workout' : 'Log workout'}</h1>
        <p className="text-slate-400">
          Pick how each move is tracked. <strong className="text-slate-200">Bodyweight</strong> = reps (and optional
          extra load like a vest). <strong className="text-slate-200">Weights</strong> = reps + weight per set.
        </p>
      </div>

      <GlassCard solid className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-lg text-white outline-none ring-cyan-500/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-cyan-500/30 focus:ring-2"
            placeholder="Warm-up, pain areas, RPE…"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="hybrid">Hybrid</option>
              <option value="mobility">Mobility</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Tags (comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="legs, push, 5x5"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white"
            />
          </div>
        </div>
      </GlassCard>

      {exercises.length === 0 && (
        <GlassCard className="text-center">
          <p className="text-slate-300">Start by adding your first exercise.</p>
          <Pressable
            onClick={addExercise}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            <Plus className="h-4 w-4" />
            Add exercise
          </Pressable>
        </GlassCard>
      )}

      <AnimatePresence initial={false}>
        {exercises.map((ex) => (
          <motion.div
            key={ex.clientId}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard solid className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400">Exercise name</label>
                  <input
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.clientId, { name: e.target.value })}
                    placeholder="e.g. Push-ups, Back squat, Treadmill run"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">Tracking type</label>
                    <select
                      value={ex.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        updateExercise(ex.clientId, { type, sets: defaultSetsForType(type, units) });
                      }}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                      <option value="weight">Weights: reps + weight</option>
                      <option value="bodyweight">Bodyweight: reps (+ optional extra load)</option>
                      <option value="duration">Time / cardio: seconds or minutes</option>
                    </select>
                    {ex.type === 'bodyweight' && (
                      <p className="mt-1 text-[11px] leading-snug text-slate-500">
                        Log <span className="text-slate-300">reps</span> for each set. Use{' '}
                        <span className="text-slate-300">extra load</span> only if you add weight (vest, plate, etc.) —
                        otherwise leave it at 0.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Rest between sets (seconds)</label>
                    <input
                      type="number"
                      min={0}
                      value={ex.restSeconds}
                      onChange={(e) =>
                        updateExercise(ex.clientId, { restSeconds: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="hidden px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:gap-2">
                  <span className="text-center">Set</span>
                  <span>{ex.type === 'duration' ? 'Time (sec)' : 'Reps'}</span>
                  <span>
                    {ex.type === 'duration'
                      ? ''
                      : ex.type === 'bodyweight'
                        ? `Extra load (${units})`
                        : `Weight (${units})`}
                  </span>
                  <span className="text-center">Done</span>
                  <span />
                </div>
                {ex.sets.map((set, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 items-end gap-2 rounded-xl bg-slate-900/70 p-3 ring-1 ring-white/5 sm:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
                  >
                    <div className="flex items-center justify-center text-sm text-slate-500 sm:block">
                      <span className="sm:hidden">Set </span>
                      {idx + 1}
                    </div>
                    {ex.type === 'duration' ? (
                      <div className="sm:col-span-2">
                        <label className="text-xs text-slate-500 sm:hidden">Seconds</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-lg text-white"
                          placeholder="Seconds for this interval"
                          value={set.durationSeconds ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? undefined : Number(e.target.value);
                            setExercises((prev) =>
                              prev.map((x) =>
                                x.clientId === ex.clientId
                                  ? {
                                      ...x,
                                      sets: x.sets.map((s, i) =>
                                        i === idx ? { ...s, durationSeconds: v } : s
                                      ),
                                    }
                                  : x
                              )
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="mb-1 block text-xs text-slate-500 sm:hidden">Reps</label>
                          <input
                            type="number"
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-lg text-white"
                            aria-label={`Set ${idx + 1} reps`}
                            value={set.reps ?? ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? undefined : Number(e.target.value);
                              setExercises((prev) =>
                                prev.map((x) =>
                                  x.clientId === ex.clientId
                                    ? {
                                        ...x,
                                        sets: x.sets.map((s, i) => (i === idx ? { ...s, reps: v } : s)),
                                      }
                                    : x
                                )
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-slate-500 sm:hidden">
                            {ex.type === 'bodyweight' ? `Extra load (${units})` : `Weight (${units})`}
                          </label>
                          <input
                            type="number"
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-lg text-white"
                            aria-label={
                              ex.type === 'bodyweight'
                                ? `Set ${idx + 1} extra load in ${units}`
                                : `Set ${idx + 1} weight in ${units}`
                            }
                            placeholder={ex.type === 'bodyweight' ? '0 if bodyweight only' : ''}
                            value={set.weight ?? ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? undefined : Number(e.target.value);
                              setExercises((prev) =>
                                prev.map((x) =>
                                  x.clientId === ex.clientId
                                    ? {
                                        ...x,
                                        sets: x.sets.map((s, i) => (i === idx ? { ...s, weight: v } : s)),
                                      }
                                    : x
                                )
                              );
                            }}
                          />
                        </div>
                      </>
                    )}
                    <Pressable
                      onClick={() => toggleSetComplete(ex.clientId, idx)}
                      className={`flex h-12 w-12 items-center justify-center justify-self-end rounded-xl border sm:justify-self-center ${
                        set.completed
                          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                          : 'border-white/10 bg-slate-950 text-slate-400'
                      }`}
                      aria-label="Mark set complete"
                    >
                      <motion.span
                        key={set.completed ? 'on' : 'off'}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <Check className="h-6 w-6" />
                      </motion.span>
                    </Pressable>
                    <Pressable
                      onClick={() => removeSet(ex.clientId, idx)}
                      className="flex h-12 w-12 items-center justify-center justify-self-end rounded-xl border border-white/10 text-slate-400 sm:justify-self-center"
                      aria-label="Remove set"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Pressable>
                  </div>
                ))}
              </div>

              <Pressable
                onClick={() => addSet(ex.clientId)}
                className="w-full rounded-xl border border-dashed border-white/20 py-3 text-sm text-slate-300"
              >
                + Add set
              </Pressable>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>

      {exercises.length > 0 && (
        <Pressable
          onClick={addExercise}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-4 text-sm font-semibold text-white hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
          Add another exercise
        </Pressable>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Pressable
          disabled={saving || exercises.length === 0}
          onClick={() => void save(false)}
          className="flex-1 rounded-xl border border-white/15 py-4 text-center text-sm font-semibold text-white disabled:opacity-40"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save draft'}
        </Pressable>
        <Pressable
          disabled={saving || exercises.length === 0}
          onClick={() => void save(true)}
          className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 py-4 text-center text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Finish workout'}
        </Pressable>
      </div>

      <RestTimer open={restOpen} seconds={restSeconds} onClose={() => setRestOpen(false)} />
    </div>
  );
}
