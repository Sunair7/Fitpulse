import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const workoutFrequency = asyncHandler(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);

  const agg = await Workout.aggregate([
    { $match: { user: req.user._id, createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json({ series: agg.map((r) => ({ date: r._id, count: r.count })) });
});

export const nutritionTrend = asyncHandler(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);

  const agg = await Nutrition.aggregate([
    { $match: { user: req.user._id, loggedAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
        calories: { $sum: '$calories' },
        protein: { $sum: '$protein' },
        carbs: { $sum: '$carbs' },
        fats: { $sum: '$fats' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json({ series: agg });
});

export const liftingSummary = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user._id, category: 'strength' })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('title exercises createdAt');
  const points = [];
  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      if (ex.type !== 'weight') continue;
      let maxW = 0;
      for (const s of ex.sets || []) {
        if (typeof s.weight === 'number' && s.weight > maxW) maxW = s.weight;
      }
      if (maxW > 0) {
        points.push({
          date: w.createdAt?.toISOString().slice(0, 10),
          exercise: ex.name,
          maxWeight: maxW,
        });
      }
    }
  }
  res.json({ points: points.slice(0, 200) });
});
