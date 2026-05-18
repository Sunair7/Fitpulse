import Nutrition from '../models/Nutrition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export function caloriesFromMacros(protein, carbs, fats) {
  const p = Number(protein) || 0;
  const c = Number(carbs) || 0;
  const f = Number(fats) || 0;
  return Math.round(p * 4 + c * 4 + f * 9);
}

export const listNutrition = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  const parts = [{ user: req.user._id }];
  if (from || to) {
    const range = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    parts.push({ loggedAt: range });
  }
  const search = req.query.search;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    parts.push({ $or: [{ foodName: rx }, { 'foodItems.name': rx }] });
  }
  const q = parts.length === 1 ? parts[0] : { $and: parts };
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const entries = await Nutrition.find(q).sort({ loggedAt: -1 }).limit(limit);
  res.json({ entries });
});

function normalizeFoodItems(body) {
  if (!Array.isArray(body.foodItems)) return [];
  return body.foodItems.map((i) => ({
    name: String(i.name || '').trim() || 'Item',
    quantity: Number(i.quantity) >= 0 ? Number(i.quantity) : 1,
    unit: String(i.unit || 'serving').trim(),
    measureKind: i.measureKind === 'grams' ? 'grams' : 'serving',
    gramsPerServing: Number(i.gramsPerServing) >= 0 ? Number(i.gramsPerServing) : 0,
  }));
}

export const suggestions = asyncHandler(async (req, res) => {
  const entries = await Nutrition.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(50);
  const seen = new Set();
  const suggestions = [];
  for (const e of entries) {
    const label = (e.foodName && e.foodName.trim()) || e.foodItems?.[0]?.name?.trim();
    if (!label) continue;
    const key = `${label.toLowerCase()}|${e.mealType}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      label,
      mealType: e.mealType,
      protein: e.protein,
      carbs: e.carbs,
      fats: e.fats,
      calories: caloriesFromMacros(e.protein, e.carbs, e.fats),
      foodItems: e.foodItems || [],
    });
    if (suggestions.length >= 14) break;
  }
  res.json({ suggestions });
});

export const createNutrition = asyncHandler(async (req, res) => {
  const body = req.body;
  const foodItems = normalizeFoodItems(body);
  const protein = body.protein ?? 0;
  const carbs = body.carbs ?? 0;
  const fats = body.fats ?? 0;
  const computed = caloriesFromMacros(protein, carbs, fats);
  const manual = Boolean(body.manualCaloriesOverride);
  const calories = manual && Number.isFinite(Number(body.calories)) ? Number(body.calories) : computed;

  const entry = await Nutrition.create({
    user: req.user._id,
    loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
    mealType: body.mealType || 'snack',
    protein,
    carbs,
    fats,
    calories,
    foodName: body.foodName || '',
    foodItems,
    source: body.source === 'lookup' ? 'lookup' : 'manual',
  });
  res.status(201).json({ entry });
});

export const updateNutrition = asyncHandler(async (req, res) => {
  const entry = await Nutrition.findOne({ _id: req.params.id, user: req.user._id });
  if (!entry) {
    return res.status(404).json({ message: 'Entry not found' });
  }
  const body = req.body;
  const fields = ['mealType', 'protein', 'carbs', 'fats', 'foodName', 'source', 'loggedAt'];
  for (const f of fields) {
    if (body[f] !== undefined) {
      if (f === 'loggedAt') entry.loggedAt = new Date(body.loggedAt);
      else entry[f] = body[f];
    }
  }
  if (body.foodItems !== undefined) {
    entry.foodItems = normalizeFoodItems(body);
  }
  if (body.calories !== undefined || body.protein !== undefined || body.carbs !== undefined || body.fats !== undefined) {
    const p = entry.protein;
    const c = entry.carbs;
    const f = entry.fats;
    const computed = caloriesFromMacros(p, c, f);
    if (Boolean(body.manualCaloriesOverride) && Number.isFinite(Number(body.calories))) {
      entry.calories = Number(body.calories);
    } else {
      entry.calories = computed;
    }
  }
  await entry.save();
  res.json({ entry });
});

export const deleteNutrition = asyncHandler(async (req, res) => {
  const result = await Nutrition.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Entry not found' });
  }
  res.json({ message: 'Deleted' });
});

export const dailyTotals = asyncHandler(async (req, res) => {
  const day = req.query.date ? new Date(String(req.query.date)) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  const agg = await Nutrition.aggregate([
    {
      $match: {
        user: req.user._id,
        loggedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        protein: { $sum: '$protein' },
        carbs: { $sum: '$carbs' },
        fats: { $sum: '$fats' },
        caloriesLogged: { $sum: '$calories' },
      },
    },
  ]);

  const row = agg[0] || { protein: 0, carbs: 0, fats: 0, caloriesLogged: 0 };
  const protein = row.protein || 0;
  const carbs = row.carbs || 0;
  const fats = row.fats || 0;
  const calories = caloriesFromMacros(protein, carbs, fats);

  res.json({
    date: start.toISOString().slice(0, 10),
    protein,
    carbs,
    fats,
    calories,
    caloriesLogged: row.caloriesLogged || 0,
  });
});
