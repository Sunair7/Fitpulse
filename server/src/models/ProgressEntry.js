import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loggedAt: { type: Date, default: Date.now, index: true },
    category: {
      type: String,
      enum: ['weight', 'measurement', 'performance'],
      required: true,
    },
    metricKey: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    unit: { type: String, default: '', trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('ProgressEntry', progressEntrySchema);
