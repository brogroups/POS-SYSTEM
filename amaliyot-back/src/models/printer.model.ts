import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const PrinterSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  ip_address: { type: String, required: true },
  port: { type: Number, required: true },
  type: { type: String, enum: ['RECEIPT', 'KITCHEN'], required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at' } });

const PrinterMongoose = mongoose.models.Printer || mongoose.model('Printer', PrinterSchema);

export const PrinterModel = createModelWrapper(PrinterMongoose);
