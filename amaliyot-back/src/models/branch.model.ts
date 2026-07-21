import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const BranchSchema = new Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  logo: String,
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date,
  manager_id: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const BranchMongoose = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);

export const BranchModel = createModelWrapper(BranchMongoose);
