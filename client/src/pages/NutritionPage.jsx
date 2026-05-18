import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { Pressable } from '../components/Skeleton.jsx';
import { api } from '../lib/api.js';
import { caloriesFromMacros } from '../lib/nutritionMath.js';

const meals = ['breakfast', 'lunch', 'dinner', 'snack'];

function emptyFoodRow() {
  return {
    name: '',
    quantity: '1',
    measureKind: 'serving',
    gramsPerServing: '',
  };
}

export function NutritionPage() {
  const [daily, setDaily] = useState(null);
  const [entries, setEntries] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    mealType: 'lunch',
    protein: '',
    carbs: '',
    fats: '',
    calories: '',
    manualCaloriesOverride: false,
    foodItems: [emptyFoodRow()],
  });
  const [busy, setBusy] = useState(false);

  const computedCalories = useMemo(
    () => caloriesFromMacros(form.protein, form.carbs, form.fats),
    [form.protein, form.carbs, form.fats]
  );

  async function load() {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [d, e, sug] = await Promise.all([
        api(`/nutrition/daily?date=${today}`),
        api('/nutrition'),
        api('/nutrition/suggestions').catch(() => ({ suggestions: [] })),
      ]);
      setDaily(d);
      setEntries((e.entries || []).filter((x) => x.loggedAt?.slice(0, 10) === today));
      setSuggestions(sug.suggestions || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function updateFoodItem(idx, patch) {
    setForm((f) => ({
      ...f,
      foodItems: f.foodItems.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }

  function addFoodRow() {
    setForm((f) => ({ ...f, foodItems: [...f.foodItems, emptyFoodRow()] }));
  }

  function removeFoodRow(idx) {
    setForm((f) => {
      const next = f.foodItems.filter((_, i) => i !== idx);
      return {
        ...f,
        foodItems: next.length ? next : [emptyFoodRow()],
      };
    });
  }

  function applySuggestion(s) {
    setForm({
      mealType: s.mealType || 'lunch',
      protein: s.protein != null ? String(s.protein) : '',
      carbs: s.carbs != null ? String(s.carbs) : '',
      fats: s.fats != null ? String(s.fats) : '',
      calories: '',
      manualCaloriesOverride: false,
      foodItems:
        Array.isArray(s.foodItems) && s.foodItems.length > 0
          ? s.foodItems.map((i) => ({
              name: i.name || '',
              quantity: String(i.quantity ?? 1),
              measureKind: i.measureKind === 'grams' ? 'grams' : 'serving',
              gramsPerServing: i.gramsPerServing != null && i.gramsPerServing !== 0 ? String(i.gramsPerServing) : '',
            }))
          : [{ name: s.label || '', quantity: '1', measureKind: 'serving', gramsPerServing: '' }],
    });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const foodItems = form.foodItems
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.measureKind === 'grams' ? 'g' : 'serving',
          measureKind: i.measureKind === 'grams' ? 'grams' : 'serving',
          gramsPerServing:
            i.measureKind === 'serving' && i.gramsPerServing !== ''
              ? Number(i.gramsPerServing) || 0
              : 0,
        }));
      const protein = Number(form.protein) || 0;
      const carbs = Number(form.carbs) || 0;
      const fats = Number(form.fats) || 0;
      const manual = form.manualCaloriesOverride;
      const caloriesVal = Number(form.calories);

      await api('/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          mealType: form.mealType,
          protein,
          carbs,
          fats,
          calories: manual && Number.isFinite(caloriesVal) ? caloriesVal : caloriesFromMacros(protein, carbs, fats),
          manualCaloriesOverride: manual && Number.isFinite(caloriesVal),
          foodName: foodItems[0]?.name || '',
          foodItems,
          source: 'manual',
        }),
      });
      setForm({
        mealType: 'lunch',
        protein: '',
        carbs: '',
        fats: '',
        calories: '',
        manualCaloriesOverride: false,
        foodItems: [emptyFoodRow()],
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const loggedMismatch =
    daily &&
    daily.caloriesLogged != null &&
    Math.round(daily.caloriesLogged) !== Math.round(daily.calories) &&
    Math.round(daily.caloriesLogged) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Nutrition</h1>
        <p className="text-slate-400">Meal types, food items with quantities, and macros.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="font-semibold text-white">Today&apos;s totals</h2>
          <p className="mt-1 text-xs text-slate-500">
            Calories are derived from macros (P×4 + C×4 + F×9) so daily energy stays consistent with what you logged.
          </p>
          {loading ? (
            <Skeleton className="mt-4 h-24 w-full" />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Calories (from macros)" value={`${Math.round(daily?.calories ?? 0)}`} />
              <Stat label="Protein" value={`${Math.round(daily?.protein ?? 0)}g`} />
              <Stat label="Carbs" value={`${Math.round(daily?.carbs ?? 0)}g`} />
              <Stat label="Fats" value={`${Math.round(daily?.fats ?? 0)}g`} />
            </div>
          )}
          {!loading && loggedMismatch && (
            <p className="mt-3 text-xs text-amber-300/90">
              Some older entries used manual calories ({Math.round(daily.caloriesLogged)} kcal logged vs{' '}
              {Math.round(daily.calories)} kcal from macros). New entries default to the macro formula.
            </p>
          )}
        </GlassCard>

        <GlassCard solid>
          <h2 className="font-semibold text-white">Log meal</h2>
          <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400">Meal</label>
              <select
                value={form.mealType}
                onChange={(e) => setForm((f) => ({ ...f, mealType: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
              >
                {meals.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400">Food items</p>
              {form.foodItems.map((it, idx) => (
                <div key={idx} className="rounded-xl bg-slate-900/50 p-3 ring-1 ring-white/5">
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder="Food name"
                      value={it.name}
                      onChange={(e) => updateFoodItem(idx, { name: e.target.value })}
                      className="min-w-[8rem] flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-white"
                    />
                    <select
                      value={it.measureKind}
                      onChange={(e) => updateFoodItem(idx, { measureKind: e.target.value })}
                      className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white"
                      aria-label="Measure as servings or grams"
                    >
                      <option value="serving">Servings</option>
                      <option value="grams">Grams</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder={it.measureKind === 'grams' ? 'Grams' : 'Servings'}
                      value={it.quantity}
                      onChange={(e) => updateFoodItem(idx, { quantity: e.target.value })}
                      className="w-24 rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-white"
                      aria-label={it.measureKind === 'grams' ? 'Amount in grams' : 'Number of servings'}
                    />
                    <span className="self-center text-xs text-slate-500">
                      {it.measureKind === 'grams' ? 'g' : '× serving'}
                    </span>
                    <Pressable
                      type="button"
                      onClick={() => removeFoodRow(idx)}
                      className="rounded-lg border border-white/10 px-2 py-2 text-xs text-slate-300"
                    >
                      ✕
                    </Pressable>
                  </div>
                  {it.measureKind === 'serving' && (
                    <div className="mt-2">
                      <label className="text-[11px] text-slate-500">
                        Optional: grams in 1 serving (helps future scaling, e.g. nutrition label)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="e.g. 30 (g per serving)"
                        value={it.gramsPerServing}
                        onChange={(e) => updateFoodItem(idx, { gramsPerServing: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
              <Pressable
                type="button"
                onClick={addFoodRow}
                className="w-full rounded-xl border border-dashed border-white/20 py-2 text-sm text-slate-300"
              >
                + Add food line
              </Pressable>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Protein (g)" value={form.protein} onChange={(v) => setForm((f) => ({ ...f, protein: v }))} />
              <Field label="Carbs (g)" value={form.carbs} onChange={(v) => setForm((f) => ({ ...f, carbs: v }))} />
              <Field label="Fats (g)" value={form.fats} onChange={(v) => setForm((f) => ({ ...f, fats: v }))} />
              <div>
                <label className="text-xs text-slate-400">Calories</label>
                <div className="mt-1 space-y-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-3">
                  <p className="text-lg font-semibold tabular-nums text-white">
                    {computedCalories}
                    <span className="ml-1 text-xs font-normal text-slate-500">kcal from macros</span>
                  </p>
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={form.manualCaloriesOverride}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          manualCaloriesOverride: e.target.checked,
                          calories: e.target.checked ? f.calories : '',
                        }))
                      }
                    />
                    Override with manual calories (advanced)
                  </label>
                  {form.manualCaloriesOverride && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Manual kcal"
                      value={form.calories}
                      onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-white"
                    />
                  )}
                </div>
              </div>
            </div>
            <Pressable
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Add entry'}
            </Pressable>
          </form>
        </GlassCard>
      </div>

      {suggestions.length > 0 && (
        <GlassCard>
          <h2 className="font-semibold text-white">Frequent &amp; recent</h2>
          <p className="mt-1 text-xs text-slate-500">Tap to pre-fill the form — you can still edit before saving.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <li key={`${s.label}-${s.mealType}-${i}`}>
                <Pressable
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="rounded-full border border-white/15 bg-slate-900/60 px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-white/10"
                >
                  <span className="font-medium text-white">{s.label}</span>
                  <span className="ml-2 capitalize text-slate-500">{s.mealType}</span>
                  <span className="ml-2 font-mono text-slate-400">
                    {caloriesFromMacros(s.protein, s.carbs, s.fats)} kcal
                  </span>
                </Pressable>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="font-semibold text-white">Today&apos;s entries</h2>
        {loading ? (
          <Skeleton className="mt-4 h-16 w-full" />
        ) : entries.length === 0 ? (
          <p className="mt-3 text-slate-400">No entries yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {entries.map((en) => {
              const fromMacros = caloriesFromMacros(en.protein, en.carbs, en.fats);
              return (
                <li
                  key={en._id}
                  className="rounded-xl bg-slate-900/60 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/5"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="capitalize text-slate-300">{en.mealType}</span>
                    <span className="font-mono text-white">
                      P{en.protein} C{en.carbs} F{en.fats} · {fromMacros} kcal
                      {Number(en.calories) !== fromMacros && (
                        <span className="ml-1 text-xs text-slate-500">(stored {en.calories})</span>
                      )}
                    </span>
                  </div>
                  {en.foodItems?.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-xs text-slate-400">
                      {en.foodItems.map((fi, i) => (
                        <li key={i}>
                          {fi.name} — {fi.quantity}{' '}
                          {fi.measureKind === 'grams' || fi.unit === 'g' ? 'g' : fi.unit || 'serving'}
                          {fi.measureKind === 'serving' && fi.gramsPerServing > 0 && (
                            <span className="text-slate-500"> ({fi.gramsPerServing} g/serving)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/50 p-3 ring-1 ring-white/5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
      />
    </div>
  );
}
