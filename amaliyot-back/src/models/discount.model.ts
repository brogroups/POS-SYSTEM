import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const DiscountSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
  value: { type: Number, required: true },
  starts_at: Date,
  ends_at: Date,
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at' } });

const DiscountMongoose = mongoose.models.Discount || mongoose.model('Discount', DiscountSchema);

export const DiscountModel = createModelWrapper(DiscountMongoose);
