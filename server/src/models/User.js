import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      match: /^[a-z0-9_]+$/,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    profilePicture: { type: String, default: '' },
    preferences: {
      units: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
      emailNotifications: { type: Boolean, default: true },
      reminderAlerts: { type: Boolean, default: true },
    },
    privacy: {
      publicProfile: { type: Boolean, default: false },
    },
    consent: {
      termsAccepted: { type: Boolean, default: false },
      analyticsOptIn: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
