import Reminder from '../models/Reminder.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listReminders = asyncHandler(async (req, res) => {
  const items = await Reminder.find({ user: req.user._id }).sort({ remindAt: 1 }).limit(200);
  res.json({ reminders: items });
});

export const createReminder = asyncHandler(async (req, res) => {
  const { title, note, kind, remindAt } = req.body;
  const r = await Reminder.create({
    user: req.user._id,
    title: title || 'Reminder',
    note: note || '',
    kind: kind || 'workout',
    remindAt: remindAt ? new Date(remindAt) : new Date(),
  });
  res.status(201).json({ reminder: r });
});

export const updateReminder = asyncHandler(async (req, res) => {
  const r = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
  if (!r) return res.status(404).json({ message: 'Not found' });
  const fields = ['title', 'note', 'kind', 'remindAt', 'completed'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      if (f === 'remindAt') r.remindAt = new Date(req.body.remindAt);
      else r[f] = req.body[f];
    }
  }
  await r.save();
  res.json({ reminder: r });
});

export const deleteReminder = asyncHandler(async (req, res) => {
  const result = await Reminder.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});
