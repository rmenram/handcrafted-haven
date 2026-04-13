import { model, models, Schema, type InferSchemaType } from 'mongoose';

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

const Review = models.Review || model('Review', reviewSchema);

export default Review;
