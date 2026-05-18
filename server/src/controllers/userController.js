import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validationResult } from 'express-validator';

function userResponse(user) {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    preferences: user.preferences,
    privacy: user.privacy,
    consent: user.consent,
  };
}

export const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const { name, username, profilePicture, preferences, privacy, consent } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (username !== undefined && username !== user.username) {
    const next = String(username).toLowerCase().trim();
    const taken = await User.findOne({ username: next, _id: { $ne: user._id } });
    if (taken) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    user.username = next;
  }
  if (name !== undefined) user.name = name;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (preferences) {
    if (preferences.units) user.preferences.units = preferences.units === 'lbs' ? 'lbs' : 'kg';
    if (preferences.theme) {
      const t = preferences.theme;
      user.preferences.theme = ['dark', 'light', 'system'].includes(t) ? t : 'dark';
    }
    if (typeof preferences.emailNotifications === 'boolean') {
      user.preferences.emailNotifications = preferences.emailNotifications;
    }
    if (typeof preferences.reminderAlerts === 'boolean') {
      user.preferences.reminderAlerts = preferences.reminderAlerts;
    }
  }
  if (privacy && typeof privacy.publicProfile === 'boolean') {
    user.privacy.publicProfile = privacy.publicProfile;
  }
  if (consent) {
    if (typeof consent.termsAccepted === 'boolean') user.consent.termsAccepted = consent.termsAccepted;
    if (typeof consent.analyticsOptIn === 'boolean') user.consent.analyticsOptIn = consent.analyticsOptIn;
  }
  await user.save();
  res.json({ user: userResponse(user) });
});
