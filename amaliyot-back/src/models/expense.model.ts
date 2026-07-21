import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const ExpenseSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  expense_date: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approved_by: { type: Schema.Types.ObjectId, ref: 'User' },
  rejected_reason: String,
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at' } });

const ExpenseMongoose = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

export const ExpenseModel = createModelWrapper(ExpenseMongoose);
