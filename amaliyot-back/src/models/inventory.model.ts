import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const InventorySchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  minimum_quantity: Number
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const InventoryMongoose = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);

export const InventoryModel = createModelWrapper(InventoryMongoose);
