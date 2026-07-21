import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const HookahSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Classic, Premium, VIP
  tobacco_weight: { type: Number, required: true }, // in grams
  bowl_type: { type: String, required: true }, // e.g. clay, phunnel
  heat_system: { type: String, required: true }, // e.g. kaloud, foil
  selling_price: { type: Number, required: true },
  preparation_time: { type: Number, required: true }, // in minutes
  notes: String,
  image: String,
  is_available: { type: Boolean, default: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' }, // linked sellable product
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const HookahMongoose = mongoose.models.Hookah || mongoose.model('Hookah', HookahSchema);

export const HookahModel = createModelWrapper(HookahMongoose);
