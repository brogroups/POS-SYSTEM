import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const StockMovementSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT', 'WASTE'], required: true },
  quantity: { type: Number, required: true },
  note: String
}, { timestamps: { createdAt: 'created_at' } });

const StockMovementMongoose = mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema);

export const StockMovementModel = createModelWrapper(StockMovementMongoose);
