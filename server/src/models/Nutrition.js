import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    /** User-facing unit label, e.g. "g", "oz", "serving" */
    unit: { type: String, default: 'serving', trim: true },
    /** How to interpret quantity: weight in grams vs abstract servings */
    measureKind: { type: String, enum: ['grams', 'serving'], default: 'serving' },
    /** When measureKind is serving, optional grams per 1 serving for clarity */
    gramsPerServing: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loggedAt: { type: Date, default: Date.now, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'snack',
    },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fats: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 0, min: 0 },
    foodName: { type: String, default: '', trim: true },
    foodItems: { type: [foodItemSchema], default: [] },
    source: { type: String, enum: ['manual', 'lookup'], default: 'manual' },
  },
  { timestamps: true }
);

export default mongoose.model('Nutrition', nutritionSchema);
