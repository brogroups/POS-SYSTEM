import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const KitchenDisplaySchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at' } });

const KitchenDisplayMongoose = mongoose.models.KitchenDisplay || mongoose.model('KitchenDisplay', KitchenDisplaySchema);

export const KitchenDisplayModel = createModelWrapper(KitchenDisplayMongoose);
