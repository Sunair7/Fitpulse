import SupportMessage from '../models/SupportMessage.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createSupportMessage = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message required' });
  }
  const doc = await SupportMessage.create({
    user: req.user._id,
    subject: String(subject).trim(),
    message: String(message).trim(),
  });
  res.status(201).json({ ticket: doc });
});

export const listMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportMessage.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ tickets });
});
