import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const CustomerSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  full_name: { type: String, required: true },
  phone: String,
  bonus_balance: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  telegram_chat_id: String,
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CustomerMongoose = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export const CustomerModel = createModelWrapper(CustomerMongoose);
