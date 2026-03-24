import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

const createProductSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2),
  image: z.string().url(),
  price: z.number().min(0),
  inStock: z.boolean(),
});

const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1),
});

function unauthorizedResponse() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

async function getArtisanPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (payload.role !== 'artisan') {
    return null;
  }

  return payload;
}

export async function GET() {
  try {
    const payload = await getArtisanPayload();
    if (!payload) {
      return unauthorizedResponse();
    }

    await connectToDatabase();

    const products = await Product.find({
      $or: [{ artisanUserId: payload.sub }, { artisanName: payload.name }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      products: products.map((product) => ({
        id: String(product._id),
        name: product.name,
        description: product.description,
        category: product.category,
        image: product.image,
        price: product.price,
        inStock: product.inStock,
        featured: Boolean(product.featured),
      })),
    });
  } catch {
    return NextResponse.json({ message: 'Unable to load products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getArtisanPayload();
    if (!payload) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.create({
      ...parsed.data,
      artisanName: payload.name,
      artisanUserId: payload.sub,
      rating: 0,
      reviewCount: 0,
    });

    return NextResponse.json(
      {
        product: {
          id: String(product._id),
          name: product.name,
          description: product.description,
          category: product.category,
          image: product.image,
          price: product.price,
          inStock: product.inStock,
          featured: Boolean(product.featured),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: 'Unable to create product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await getArtisanPayload();
    if (!payload) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findOneAndUpdate(
      {
        _id: parsed.data.id,
        $or: [{ artisanUserId: payload.sub }, { artisanName: payload.name }],
      },
      {
        $set: {
          name: parsed.data.name,
          description: parsed.data.description,
          category: parsed.data.category,
          image: parsed.data.image,
          price: parsed.data.price,
          inStock: parsed.data.inStock,
          artisanUserId: payload.sub,
          artisanName: payload.name,
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
      },
    });
  } catch {
    return NextResponse.json({ message: 'Unable to update product' }, { status: 500 });
  }
}
