import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const PaymentSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, enum: ['CASH', 'CARD', 'TRANSFER', 'BONUS'], required: true },
  paid_at: { type: Date, default: Date.now }
}, { timestamps: false });

const PaymentMongoose = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export const PaymentModel = createModelWrapper(PaymentMongoose);
