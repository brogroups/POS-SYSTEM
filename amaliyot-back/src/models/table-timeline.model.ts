import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const TableTimelineSchema = new Schema({
  table_id: { type: Schema.Types.ObjectId, ref: 'RestaurantTable', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  session_id: { type: Schema.Types.ObjectId, ref: 'Order' }, // same as order_id, explicit alias for clarity
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action_type: { type: String, required: true }, // e.g. 'TABLE_OPENED', 'ITEM_ADDED', 'ITEM_REMOVED', 'TABLE_FROZEN', 'RECEIPT_PRINTED', 'PAYMENT_RECEIVED', 'SESSION_CREATED', 'SESSION_PAID', 'ITEM_SWAPPED', 'ITEM_MOVED'
  details: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} } // structured data for the action
}, { timestamps: { createdAt: 'created_at' } });

const TableTimelineMongoose = mongoose.models.TableTimeline || mongoose.model('TableTimeline', TableTimelineSchema);

export const TableTimelineModel = createModelWrapper(TableTimelineMongoose);
