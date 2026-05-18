import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loggedAt: { type: Date, default: Date.now, index: true },
    /** Stored in kilograms for consistent charts */
    weightKg: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('WeightLog', weightLogSchema);
