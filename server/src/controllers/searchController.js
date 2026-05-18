import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const searchAll = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) {
    return res.json({ workouts: [], nutrition: [], users: [] });
  }
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [workouts, nutrition, users] = await Promise.all([
    Workout.find({
      user: req.user._id,
      $or: [{ title: rx }, { notes: rx }, { tags: rx }],
    })
      .sort({ createdAt: -1 })
      .limit(25)
      .select('title notes category tags createdAt completedAt'),
    Nutrition.find({
      user: req.user._id,
      $or: [{ foodName: rx }, { 'foodItems.name': rx }],
    })
      .sort({ loggedAt: -1 })
      .limit(25)
      .select('mealType foodName calories loggedAt'),
    User.find({
      'privacy.publicProfile': true,
      username: { $exists: true, $nin: [null, ''] },
      $or: [{ username: rx }, { name: rx }],
    })
      .limit(25)
      .select('username name profilePicture'),
  ]);

  res.json({
    workouts,
    nutrition,
    users: users.map((u) => ({
      id: u._id,
      username: u.username,
      name: u.name,
      profilePicture: u.profilePicture,
    })),
  });
});
