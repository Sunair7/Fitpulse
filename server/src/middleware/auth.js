import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './errorHandler.js';

function getToken(req) {
  if (req.cookies?.token) return req.cookies.token;
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7);
  return null;
}

export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    const err = new Error('Not authorized');
    err.statusCode = 401;
    throw err;
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const err = new Error('Not authorized');
    err.statusCode = 401;
    throw err;
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }
  req.user = user;
  next();
});
