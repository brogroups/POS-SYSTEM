import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const NotificationSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at' } });

const NotificationMongoose = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export const NotificationModel = createModelWrapper(NotificationMongoose);
