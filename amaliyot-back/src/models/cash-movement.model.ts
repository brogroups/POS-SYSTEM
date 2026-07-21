import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const CashMovementSchema = new Schema({
  shift_session_id: { type: Schema.Types.ObjectId, ref: 'ShiftSession', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'OPENING_CASH',
      'CLOSING_CASH',
      'MANUAL_DEPOSIT',
      'MANUAL_WITHDRAWAL',
      'ORDER_PAYMENT',
      'EXPENSE_PAYMENT',
      'SUPPLIER_PAYMENT',
      'REFUND',
      'ADJUSTMENT'
    ],
    required: true
  },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  reference_id: String, // link to source document (order_id, expense_id, purchase_id)
  reference_type: { type: String, enum: ['ORDER', 'EXPENSE', 'PURCHASE', 'MANUAL', 'SHIFT'], default: 'MANUAL' }
}, { timestamps: { createdAt: 'created_at' } });

const CashMovementMongoose = mongoose.models.CashMovement || mongoose.model('CashMovement', CashMovementSchema);

export const CashMovementModel = createModelWrapper(CashMovementMongoose);
