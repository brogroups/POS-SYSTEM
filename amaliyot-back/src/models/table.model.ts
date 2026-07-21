import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const RestaurantTableSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_number: { type: Schema.Types.Mixed, required: true },
  seats: { type: Number, required: true },
  qr_code: String,
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'FROZEN'], default: 'AVAILABLE' },
  room_name: { type: String, default: 'Asosiy zal' },
  vip_price_per_hour: { type: Number, default: 0 },
  is_frozen: { type: Boolean, default: false },
  frozen_at: Date,
  frozen_by: { type: Schema.Types.ObjectId, ref: 'User' },
  frozen_reason: String,
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const RestaurantTableMongoose = mongoose.models.RestaurantTable || mongoose.model('RestaurantTable', RestaurantTableSchema);

export const TableModel = createModelWrapper(RestaurantTableMongoose);
