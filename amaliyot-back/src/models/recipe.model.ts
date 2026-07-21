import mongoose, { Schema } from 'mongoose';
import { createModelWrapper } from '../config/mongoose-helper';

const RecipeSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  ingredients: [{
    ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    quantity: { type: Number, required: true }, // quantity to consume in its base unit
    unit: { type: String, required: true } // e.g. g, ml, pcs
  }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const RecipeMongoose = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);

export const RecipeModel = createModelWrapper(RecipeMongoose);
