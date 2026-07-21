import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const AuditLogSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  table_name: { type: String, required: true },
  record_id: { type: String, required: true },
  old_data: String,
  new_data: String,
  ip_address: String,
  device: { type: String, default: 'POS' },
  severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
  category: { type: String, enum: ['ORDER', 'TABLE', 'PAYMENT', 'EXPENSE', 'INVENTORY', 'HOOKAH', 'SHIFT', 'USER', 'SYSTEM'], default: 'SYSTEM' }
}, { timestamps: { createdAt: 'created_at' } });

AuditLogSchema.index({ created_at: -1 });
AuditLogSchema.index({ branch_id: 1, category: 1 });

const AuditLogMongoose = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

export const AuditLogModel = createModelWrapper(AuditLogMongoose);
