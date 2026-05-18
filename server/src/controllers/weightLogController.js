import WeightLog from '../models/WeightLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listWeightLogs = asyncHandler(async (req, res) => {
  const logs = await WeightLog.find({ user: req.user._id }).sort({ loggedAt: 1 }).limit(500);
  res.json({ logs });
});

export const createWeightLog = asyncHandler(async (req, res) => {
  const { weightKg, loggedAt } = req.body;
  if (weightKg == null || Number.isNaN(Number(weightKg))) {
    return res.status(400).json({ message: 'weightKg required' });
  }
  const log = await WeightLog.create({
    user: req.user._id,
    weightKg: Number(weightKg),
    loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
  });
  res.status(201).json({ log });
});

export const deleteWeightLog = asyncHandler(async (req, res) => {
  const result = await WeightLog.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json({ message: 'Deleted' });
});
