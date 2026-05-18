import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['strength', 'weight', 'body'],
      default: 'strength',
    },
    targetValue: { type: Number, required: true },
    startValue: { type: Number, default: 0 },
    currentValue: { type: Number },
    unit: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Goal', goalSchema);
