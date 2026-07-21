import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const UserSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  first_name: { type: String, required: true },
  last_name: String,
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SUPERADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF'], required: true },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date,
  last_login: Date
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const UserMongoose = mongoose.models.User || mongoose.model('User', UserSchema);

export const UserModel = createModelWrapper(UserMongoose);
