import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { getReviewStatsByProductId } from '@/lib/reviewStats';
import Product from '@/models/Product';

const updateFeaturedSchema = z.object({
  productIds: z.array(z.string().min(1)).max(12),
});

async function requireAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const products = await Product.find({})
      .sort({ featured: -1, updatedAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    const reviewStatsById = await getReviewStatsByProductId(
      products.map((product) => String(product._id))
    );

    return NextResponse.json({
      products: products.map((product) => ({
        id: String(product._id),
        name: product.name,
        description: product.description,
        category: product.category,
        artisanName: product.artisanName,
        image: product.image,
        price: product.price,
        inStock: product.inStock,
        rating: Number(reviewStatsById.get(String(product._id))?.rating ?? product.rating ?? 0),
        reviewCount: Number(
          reviewStatsById.get(String(product._id))?.reviewCount ?? product.reviewCount ?? 0
        ),
        featured: Boolean(product.featured),
      })),
    });
  } catch {
    return NextResponse.json({ message: 'Unable to load products' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateFeaturedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    await connectToDatabase();

    const selectedIds = parsed.data.productIds;

    await Product.updateMany({}, { $set: { featured: false } });

    if (selectedIds.length > 0) {
      await Product.updateMany({ _id: { $in: selectedIds } }, { $set: { featured: true } });
    }

    const featuredProducts = await Product.find({ featured: true, inStock: true })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({
      featuredProducts: featuredProducts.map((product) => ({
        id: String(product._id),
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        featured: Boolean(product.featured),
      })),
    });
  } catch {
    return NextResponse.json({ message: 'Unable to update featured products' }, { status: 500 });
  }
}
