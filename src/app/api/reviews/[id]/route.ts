import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { syncReviewStatsForProducts } from '@/lib/reviewStats';
import Review from '@/models/Review';

const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(3).max(1000).optional(),
  })
  .refine((value) => value.rating !== undefined || value.comment !== undefined, {
    message: 'Provide rating or comment',
  });

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requirePurchaserAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    return payload.role === 'purchaser' ? payload : null;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const payload = await requirePurchaserAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid review id' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid review update payload' }, { status: 400 });
    }

    await connectToDatabase();

    const existingReview = await Review.findById(id).select('_id productId userId').lean();

    if (!existingReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    if (String(existingReview.userId) !== payload.sub) {
      return NextResponse.json({ message: 'You can only edit your own reviews' }, { status: 403 });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(typeof parsed.data.rating === 'number' ? { rating: parsed.data.rating } : {}),
          ...(typeof parsed.data.comment === 'string' ? { comment: parsed.data.comment } : {}),
        },
      },
      { new: true }
    ).lean();

    if (!updatedReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    await syncReviewStatsForProducts([String(existingReview.productId)]);

    return NextResponse.json({
      review: {
        id: String(updatedReview._id),
        productId: String(updatedReview.productId),
        userId: String(updatedReview.userId),
        userName: payload.name,
        rating: Number(updatedReview.rating ?? 0),
        comment: String(updatedReview.comment ?? ''),
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Unable to update review' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const payload = await requirePurchaserAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid review id' }, { status: 400 });
    }

    await connectToDatabase();

    const review = await Review.findById(id).select('_id productId userId').lean();

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    if (String(review.userId) !== payload.sub) {
      return NextResponse.json(
        { message: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    await Review.deleteOne({ _id: review._id });
    await syncReviewStatsForProducts([String(review.productId)]);

    return NextResponse.json({ message: 'Review deleted' });
  } catch {
    return NextResponse.json({ message: 'Unable to delete review' }, { status: 500 });
  }
}
