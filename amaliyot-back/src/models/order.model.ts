import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';
import './order-item.model';

const OrderSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_id: { type: Schema.Types.ObjectId, ref: 'RestaurantTable' },
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer' },
  waiter_id: { type: Schema.Types.ObjectId, ref: 'User' },
  discount_id: { type: Schema.Types.ObjectId, ref: 'Discount' },
  source: { type: String, enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'], required: true },
  order_type: { type: String, enum: ['STANDARD', 'EXPRESS'], required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'], required: true },
  total_amount: { type: Number, required: true },
  discount_amount: Number,
  final_amount: { type: Number, required: true },
  notes: String,
  session_name: { type: String, default: 'Asosiy' },
  session_number: { type: Number, default: 1 },
  session_status: { type: String, enum: ['ACTIVE', 'PAID', 'CANCELLED'], default: 'ACTIVE' },
  timer_started_at: Date,
  closed_at: Date,
  closed_by: { type: Schema.Types.ObjectId, ref: 'User' },
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

OrderSchema.virtual('order_items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id',
  justOne: false
});

const OrderMongoose = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export const OrderModel = createModelWrapper(OrderMongoose);
