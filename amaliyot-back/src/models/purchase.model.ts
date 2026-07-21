import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const PurchaseSchema = new Schema({
  supplier_name: { type: String, required: true },
  invoice_number: { type: String, required: true },
  total_cost: { type: Number, required: true },
  payment_status: { type: String, enum: ['PAID', 'PENDING'], required: true },
  received_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  purchase_date: { type: Date, required: true, default: Date.now },
  items: [{
    ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    quantity: { type: Number, required: true }, // quantity purchased in the unit specified
    unit: { type: String, required: true }, // unit of purchase (e.g. kg, g, pcs)
    price_per_unit: { type: Number, required: true }
  }],
  notes: String,
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date
}, { timestamps: { createdAt: 'created_at' } });

const PurchaseMongoose = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);

export const PurchaseModel = createModelWrapper(PurchaseMongoose);
