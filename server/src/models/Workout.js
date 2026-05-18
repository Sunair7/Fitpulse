import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    reps: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    durationSeconds: { type: Number, min: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['weight', 'duration', 'bodyweight'], required: true },
    restSeconds: { type: Number, default: 90, min: 0 },
    sets: { type: [setSchema], default: [] },
  },
  { _id: true }
);

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Workout', trim: true },
    notes: { type: String, default: '' },
    category: {
      type: String,
      enum: ['strength', 'cardio', 'hybrid', 'mobility', 'other'],
      default: 'strength',
    },
    tags: { type: [String], default: [] },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    exercises: { type: [exerciseSchema], default: [] },
  },
  { timestamps: true }
);

workoutSchema.index({ title: 'text', notes: 'text', tags: 'text' });

export default mongoose.model('Workout', workoutSchema);
