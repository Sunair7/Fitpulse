import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import cors from "cors";

const PORT = Number(process.env.PORT) || 5000;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET');
  process.exit(1);
}

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://fitpulse-lime.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Connect to Database
connectDB();
