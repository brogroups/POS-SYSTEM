import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const ShiftSessionSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  cashier_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  opening_balance: { type: Number, required: true },
  closing_balance: Number,
  total_sales: Number,
  opened_at: { type: Date, default: Date.now },
  closed_at: Date,
  status: { type: String, enum: ['OPEN', 'CLOSED'], required: true }
}, { timestamps: false });

const ShiftSessionMongoose = mongoose.models.ShiftSession || mongoose.model('ShiftSession', ShiftSessionSchema);

export const ShiftSessionModel = createModelWrapper(ShiftSessionMongoose);
