import { model, models, Schema, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    lowerName: { type: String, required: true, unique: true, index: true },
    image: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function normalizeName(next) {
  if (typeof this.name === 'string') {
    this.name = this.name.trim();
    this.lowerName = this.name.toLowerCase();
  }
  next();
});

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

const Category = models.Category || model('Category', categorySchema);

export default Category;
