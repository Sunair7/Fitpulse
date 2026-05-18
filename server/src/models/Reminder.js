import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    note: { type: String, default: '' },
    kind: {
      type: String,
      enum: ['workout', 'meal', 'goal', 'other'],
      default: 'workout',
    },
    remindAt: { type: Date, required: true, index: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Reminder', reminderSchema);
