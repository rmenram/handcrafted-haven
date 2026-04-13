import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { syncReviewStatsForProducts } from '@/lib/reviewStats';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Review from '@/models/Review';
import User from '@/models/User';

const createReviewSchema = z.object({
  productId: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId')?.trim() ?? '';

    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    }

    await connectToDatabase();

    const reviews = await Review.find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = [...new Set(reviews.map((review) => String(review.userId)))];

    const users = await User.find({ _id: { $in: userIds } })
      .select('_id name')
      .lean();

    const userNameById = new Map(users.map((user) => [String(user._id), user.name]));

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    let viewer = {
      isPurchaser: false,
      hasPurchasedProduct: false,
      hasOwnReview: false,
      canCreateReview: false,
    };

    if (token) {
      try {
        const payload = verifyAuthToken(token);
        const isPurchaser = payload.role === 'purchaser';

        if (isPurchaser) {
          const [hasPurchasedProduct, ownReview] = await Promise.all([
            Order.findOne({
              purchaserUserId: payload.sub,
              'items.productId': new Types.ObjectId(productId),
            })
              .select('_id')
              .lean(),
            Review.findOne({
              productId: new Types.ObjectId(productId),
              userId: payload.sub,
            })
              .select('_id')
              .lean(),
          ]);

          viewer = {
            isPurchaser: true,
            hasPurchasedProduct: Boolean(hasPurchasedProduct),
            hasOwnReview: Boolean(ownReview),
            canCreateReview: Boolean(hasPurchasedProduct) && !Boolean(ownReview),
          };
        }
      } catch {
        // Ignore invalid session cookies for public review reads.
      }
    }

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: String(review._id),
        productId: String(review.productId),
        userId: String(review.userId),
        userName: userNameById.get(String(review.userId)) ?? 'Anonymous user',
        rating: Number(review.rating ?? 0),
        comment: String(review.comment ?? ''),
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      viewer,
    });
  } catch {
    return NextResponse.json({ message: 'Unable to load reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);

    if (payload.role !== 'purchaser') {
      return NextResponse.json({ message: 'Only purchasers can submit reviews' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid review data' }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(parsed.data.productId)) {
      return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    }

    await connectToDatabase();

    const productExists = await Product.findById(parsed.data.productId).select('_id').lean();
    if (!productExists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const hasPurchasedProduct = await Order.findOne({
      purchaserUserId: payload.sub,
      'items.productId': new Types.ObjectId(parsed.data.productId),
    })
      .select('_id')
      .lean();

    if (!hasPurchasedProduct) {
      return NextResponse.json(
        { message: 'You can only review products you have purchased' },
        { status: 403 }
      );
    }

    const existingReview = await Review.findOne({
      productId: parsed.data.productId,
      userId: payload.sub,
    })
      .select('_id')
      .lean();

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    const review = await Review.create({
      productId: new Types.ObjectId(parsed.data.productId),
      userId: new Types.ObjectId(payload.sub),
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    await syncReviewStatsForProducts([parsed.data.productId]);

    return NextResponse.json(
      {
        review: {
          id: String(review._id),
          productId: String(review.productId),
          userId: String(review.userId),
          userName: payload.name,
          rating: Number(review.rating ?? 0),
          comment: String(review.comment ?? ''),
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create review';
    const duplicateKeyError = typeof message === 'string' && message.includes('E11000');

    if (duplicateKeyError) {
      return NextResponse.json(
        { message: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: 'Unable to create review' }, { status: 500 });
  }
}
