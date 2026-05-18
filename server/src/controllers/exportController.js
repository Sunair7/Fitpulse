import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import WeightLog from '../models/WeightLog.js';
import ProgressEntry from '../models/ProgressEntry.js';
import { asyncHandler } from '../middleware/errorHandler.js';

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const exportWorkoutsCsv = asyncHandler(async (req, res) => {
  const rows = await Workout.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(2000);
  const header = ['id', 'title', 'category', 'tags', 'notes', 'createdAt', 'completedAt', 'exercisesJson'];
  const lines = [header.join(',')];
  for (const w of rows) {
    lines.push(
      [
        csvEscape(w._id),
        csvEscape(w.title),
        csvEscape(w.category),
        csvEscape((w.tags || []).join('|')),
        csvEscape(w.notes),
        csvEscape(w.createdAt?.toISOString()),
        csvEscape(w.completedAt?.toISOString()),
        csvEscape(JSON.stringify(w.exercises || [])),
      ].join(',')
    );
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="workouts.csv"');
  res.send(lines.join('\n'));
});

export const exportNutritionCsv = asyncHandler(async (req, res) => {
  const rows = await Nutrition.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(5000);
  const header = ['id', 'loggedAt', 'mealType', 'foodName', 'calories', 'protein', 'carbs', 'fats', 'foodItemsJson'];
  const lines = [header.join(',')];
  for (const n of rows) {
    lines.push(
      [
        csvEscape(n._id),
        csvEscape(n.loggedAt?.toISOString()),
        csvEscape(n.mealType),
        csvEscape(n.foodName),
        csvEscape(n.calories),
        csvEscape(n.protein),
        csvEscape(n.carbs),
        csvEscape(n.fats),
        csvEscape(JSON.stringify(n.foodItems || [])),
      ].join(',')
    );
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="nutrition.csv"');
  res.send(lines.join('\n'));
});

export const exportProgressCsv = asyncHandler(async (req, res) => {
  const rows = await ProgressEntry.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(5000);
  const wrows = await WeightLog.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(5000);
  const header = ['type', 'id', 'loggedAt', 'metric', 'value', 'unit', 'extraJson'];
  const lines = [header.join(',')];
  for (const p of rows) {
    lines.push(
      [
        'progress',
        csvEscape(p._id),
        csvEscape(p.loggedAt?.toISOString()),
        csvEscape(`${p.category}:${p.metricKey}`),
        csvEscape(p.value),
        csvEscape(p.unit),
        csvEscape(JSON.stringify(p.meta || {})),
      ].join(',')
    );
  }
  for (const w of wrows) {
    lines.push(
      [
        'weight',
        csvEscape(w._id),
        csvEscape(w.loggedAt?.toISOString()),
        csvEscape('weight:bodyweight_kg'),
        csvEscape(w.weightKg),
        csvEscape('kg'),
        csvEscape('{}'),
      ].join(',')
    );
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="progress.csv"');
  res.send(lines.join('\n'));
});
