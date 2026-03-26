import { model, models, Schema, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    artisanName: { type: String, required: true, trim: true },
    artisanUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

const existingProductModel = models.Product;

if (existingProductModel && !existingProductModel.schema.path('featured')) {
  existingProductModel.schema.add({
    featured: { type: Boolean, default: false },
  });
}

const Product = existingProductModel || model('Product', productSchema);

export default Product;
