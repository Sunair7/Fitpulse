import Goal from '../models/Goal.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notifyUser } from '../services/notify.js';

export const listGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ goals });
});

export const createGoal = asyncHandler(async (req, res) => {
  const { title, category, targetValue, startValue, currentValue, unit } = req.body;
  const goal = await Goal.create({
    user: req.user._id,
    title,
    category: category || 'strength',
    targetValue,
    startValue: startValue ?? 0,
    currentValue: currentValue ?? startValue ?? 0,
    unit: unit || '',
  });
  res.status(201).json({ goal });
});

export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  const wasOpen = !goal.completed;
  const fields = ['title', 'category', 'targetValue', 'startValue', 'currentValue', 'unit', 'completed'];
  for (const f of fields) {
    if (req.body[f] !== undefined) goal[f] = req.body[f];
  }
  await goal.save();
  if (wasOpen && goal.completed) {
    await notifyUser(goal.user, {
      type: 'goal_completed',
      title: 'Goal achieved',
      body: goal.title,
    });
  }
  res.json({ goal });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const result = await Goal.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  res.json({ message: 'Deleted' });
});
