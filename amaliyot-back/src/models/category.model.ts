import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const CategorySchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  image: String,
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CategoryMongoose = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export const CategoryModel = createModelWrapper(CategoryMongoose);
