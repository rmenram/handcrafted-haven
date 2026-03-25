import { Types } from 'mongoose';
import Product from '@/models/Product';
import Review from '@/models/Review';

type ReviewStats = {
  reviewCount: number;
  rating: number;
};

function toObjectIdList(ids: string[]) {
  return ids
    .map((id) => id.trim())
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
}

export async function getReviewStatsByProductId(productIds: string[]) {
  const validIds = toObjectIdList(productIds);
  if (validIds.length === 0) {
    return new Map<string, ReviewStats>();
  }

  const aggregates = await Review.aggregate<{
    _id: Types.ObjectId;
    reviewCount: number;
    averageRating: number;
  }>([
    {
      $match: {
        productId: { $in: validIds },
      },
    },
    {
      $group: {
        _id: '$productId',
        reviewCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const stats = new Map<string, ReviewStats>();
  for (const item of aggregates) {
    stats.set(String(item._id), {
      reviewCount: Number(item.reviewCount ?? 0),
      rating: Number(item.averageRating ?? 0),
    });
  }

  return stats;
}

export async function syncReviewStatsForProducts(productIds?: string[]) {
  const targetIds = productIds && productIds.length > 0
    ? productIds
    : (await Product.find({}, { _id: 1 }).lean()).map((product) => String(product._id));

  if (targetIds.length === 0) {
    return { processed: 0, updated: 0 };
  }

  const statsById = await getReviewStatsByProductId(targetIds);

  const operations = targetIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => {
      const stats = statsById.get(id) ?? { reviewCount: 0, rating: 0 };
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(id) },
          update: {
            $set: {
              reviewCount: stats.reviewCount,
              rating: stats.rating,
            },
          },
        },
      };
    });

  if (operations.length === 0) {
    return { processed: targetIds.length, updated: 0 };
  }

  const result = await Product.bulkWrite(operations, { ordered: false });

  return {
    processed: targetIds.length,
    updated: result.modifiedCount,
  };
}
