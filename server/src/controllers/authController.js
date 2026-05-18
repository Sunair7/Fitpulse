import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

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

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const { username, name, email, password, profilePicture, consent } = req.body;
  const [emailTaken, usernameTaken] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username: String(username).toLowerCase() }),
  ]);
  if (emailTaken) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  if (usernameTaken) {
    return res.status(400).json({ message: 'Username already taken' });
  }
  const user = await User.create({
    username: String(username).toLowerCase(),
    name,
    email,
    password,
    profilePicture: profilePicture || '',
    consent: {
      termsAccepted: Boolean(consent?.termsAccepted),
      analyticsOptIn: Boolean(consent?.analyticsOptIn),
    },
  });
  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.status(201).json({ user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const { identifier, password } = req.body;
  const id = String(identifier).trim();
  const query = id.includes('@') ? { email: id.toLowerCase() } : { username: id.toLowerCase() };
  const user = await User.findOne(query).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.json({ user: userResponse(user) });
});

export const logout = (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ message: 'Logged out' });
};

export const me = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});
