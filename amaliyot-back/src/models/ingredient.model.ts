import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['TOBACCO', 'FOOD', 'BEVERAGE', 'SUPPLY', 'OTHER'], default: 'OTHER' },
  quantity: { type: Number, required: true, default: 0 }, // always stored in base unit (e.g., grams, ml, pcs)
  base_unit: { type: String, required: true, default: 'pcs' }, // 'g', 'ml', 'pcs'
  display_unit: { type: String, required: true, default: 'pcs' }, // 'kg', 'l', 'pcs'
  min_quantity: { type: Number, default: 0 },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const IngredientMongoose = mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);

export const IngredientModel = createModelWrapper(IngredientMongoose);
