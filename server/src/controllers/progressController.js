import ProgressEntry from '../models/ProgressEntry.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listProgress = asyncHandler(async (req, res) => {
  const cat = req.query.category;
  const q = { user: req.user._id };
  if (cat) q.category = String(cat);
  const items = await ProgressEntry.find(q).sort({ loggedAt: -1 }).limit(500);
  res.json({ entries: items });
});

export const createProgress = asyncHandler(async (req, res) => {
  const { category, metricKey, value, unit, loggedAt, meta } = req.body;
  const entry = await ProgressEntry.create({
    user: req.user._id,
    category: category || 'measurement',
    metricKey: metricKey || 'metric',
    value: Number(value),
    unit: unit || '',
    loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    meta: meta && typeof meta === 'object' ? meta : {},
  });
  res.status(201).json({ entry });
});

export const deleteProgress = asyncHandler(async (req, res) => {
  const result = await ProgressEntry.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});
