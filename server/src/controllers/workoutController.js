import Workout from '../models/Workout.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notifyUser } from '../services/notify.js';

export const listWorkouts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const parts = [{ user: req.user._id }];
  const cat = req.query.category;
  const tag = req.query.tag;
  const search = req.query.search;
  if (cat) parts.push({ category: String(cat) });
  if (tag) parts.push({ tags: String(tag) });
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    parts.push({ $or: [{ title: rx }, { notes: rx }, { tags: rx }] });
  }
  const q = parts.length === 1 ? parts[0] : { $and: parts };
  const workouts = await Workout.find(q).sort({ createdAt: -1 }).limit(limit);
  res.json({ workouts });
});

export const getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' });
  }
  res.json({ workout });
});

export const createWorkout = asyncHandler(async (req, res) => {
  const { title, notes, exercises, startedAt, category, tags, completedAt } = req.body;
  const workout = await Workout.create({
    user: req.user._id,
    title: title || 'Workout',
    notes: notes || '',
    category: category || 'strength',
    tags: Array.isArray(tags) ? tags.map(String) : [],
    exercises: exercises || [],
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    completedAt: completedAt ? new Date(completedAt) : undefined,
  });
  if (workout.completedAt) {
    await notifyUser(workout.user, {
      type: 'workout_completed',
      title: 'Workout saved',
      body: workout.title,
    });
  }
  res.status(201).json({ workout });
});

export const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' });
  }
  const wasIncomplete = !workout.completedAt;
  const { title, notes, exercises, completedAt, category, tags } = req.body;
  if (title !== undefined) workout.title = title;
  if (notes !== undefined) workout.notes = notes;
  if (exercises !== undefined) workout.exercises = exercises;
  if (category !== undefined) workout.category = category;
  if (tags !== undefined) workout.tags = Array.isArray(tags) ? tags.map(String) : [];
  if (completedAt !== undefined) {
    workout.completedAt = completedAt ? new Date(completedAt) : null;
  }
  await workout.save();
  if (wasIncomplete && workout.completedAt) {
    await notifyUser(workout.user, {
      type: 'workout_completed',
      title: 'Workout completed',
      body: workout.title,
    });
  }
  res.json({ workout });
});

export const deleteWorkout = asyncHandler(async (req, res) => {
  const result = await Workout.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Workout not found' });
  }
  res.json({ message: 'Deleted' });
});
