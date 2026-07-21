import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';
import './product.model';

const OrderItemSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  kitchen_status: { type: String, enum: ['PENDING', 'PREPARING', 'READY'], required: true }
}, { 
  timestamps: { createdAt: 'created_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

OrderItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

const OrderItemMongoose = mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);

export const OrderItemModel = createModelWrapper(OrderItemMongoose);
