import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const ProductSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: String,
  image: String,
  sku: String,
  barcode: String,
  price: { type: Number, required: true },
  cost_price: Number,
  is_available: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const ProductMongoose = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export const ProductModel = createModelWrapper(ProductMongoose);
