import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

const updateProductSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2),
  image: z.string().url(),
  price: z.number().min(0),
  inStock: z.boolean(),
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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: parsed.data.name,
          description: parsed.data.description,
          category: parsed.data.category,
          image: parsed.data.image,
          price: parsed.data.price,
          inStock: parsed.data.inStock,
        },
      },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        id: String(product._id),
        name: product.name,
        description: product.description,
        category: product.category,
        image: product.image,
        price: product.price,
        inStock: product.inStock,
        featured: Boolean(product.featured),
        artisanName: product.artisanName,
        rating: Number(product.rating ?? 0),
        reviewCount: Number(product.reviewCount ?? 0),
      },
    });
  } catch {
    return NextResponse.json({ message: 'Unable to update product' }, { status: 500 });
  }
}
