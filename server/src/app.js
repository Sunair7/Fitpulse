import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import weightLogRoutes from './routes/weightLogRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'https://fitpulse-lime.vercel.app'
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);


app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/weight-logs', weightLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
