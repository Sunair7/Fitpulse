import Notification from '../models/Notification.js';

export async function notifyUser(userId, { type, title, body }) {
  await Notification.create({
    user: userId,
    type: type || 'system',
    title,
    body: body || '',
  });
}
