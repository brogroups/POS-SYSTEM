import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const OrderItemHistorySchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String, default: '' },
  change_type: { type: String, enum: ['ADD', 'REMOVE', 'QTY_CHANGE', 'SWAP', 'MOVE'], required: true },
  old_quantity: { type: Number, default: 0 },
  new_quantity: { type: Number, required: true },
  old_product_id: { type: Schema.Types.ObjectId, ref: 'Product' }, // for SWAP tracking
  old_product_name: String,
  new_product_name: String,
  old_price: Number,
  new_price: Number,
  reason: { type: String, default: '' },
  device: { type: String, default: 'POS' }
}, { timestamps: { createdAt: 'created_at' } });

const OrderItemHistoryMongoose = mongoose.models.OrderItemHistory || mongoose.model('OrderItemHistory', OrderItemHistorySchema);

export const OrderItemHistoryModel = createModelWrapper(OrderItemHistoryMongoose);
