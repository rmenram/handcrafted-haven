import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { Types } from 'mongoose';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';

type StoredCartItem = {
  productId: Types.ObjectId | string;
  name: string;
  price: number;
  image?: string;
  artisanName?: string;
  quantity: number;
};

const cartItemSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  image: z.string().trim().default(''),
  artisanName: z.string().trim().default(''),
  quantity: z.number().int().min(1),
});

const updateCartSchema = z.object({
  items: z.array(cartItemSchema),
});

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ message: 'Only purchasers can access cart' }, { status: 403 });
}

async function getPurchaserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    return payload.role === 'purchaser' ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const purchaserId = await getPurchaserIdFromCookie();
    if (!purchaserId) {
      return unauthorized();
    }

    await connectToDatabase();

    const user = await User.findById(purchaserId).select('cartItems role').lean();
    if (!user) {
      return unauthorized();
    }

    if (user.role !== 'purchaser') {
      return forbidden();
    }

    const cartItems = Array.isArray(user.cartItems) ? (user.cartItems as StoredCartItem[]) : [];

    const items = cartItems.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      price: Number(item.price ?? 0),
      image: item.image ?? '',
      artisanName: item.artisanName ?? '',
      quantity: Number(item.quantity ?? 1),
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: 'Unable to load cart' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return unauthorized();
    }

    let payload: ReturnType<typeof verifyAuthToken>;

    try {
      payload = verifyAuthToken(token);
    } catch {
      return unauthorized();
    }

    if (payload.role !== 'purchaser') {
      return forbidden();
    }

    const body = await request.json();
    const parsed = updateCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid cart payload' }, { status: 400 });
    }

    await connectToDatabase();

    const validItems = parsed.data.items.filter((item) => Types.ObjectId.isValid(item.productId));

    const validProductIds = validItems.map((item) => new Types.ObjectId(item.productId));

    const products = await Product.find({ _id: { $in: validProductIds } })
      .select('_id inStock stockQuantity')
      .lean();

    const stockByProductId = new Map(
      products.map((product) => [
        String(product._id),
        Number(product.stockQuantity ?? (product.inStock ? 1 : 0)),
      ])
    );

    const inStockItems = validItems.filter((item) => {
      const available = stockByProductId.get(item.productId);
      if (typeof available !== 'number') {
        return false;
      }

      return available >= item.quantity;
    });

    const updatedUser = await User.findByIdAndUpdate(
      payload.sub,
      {
        $set: {
          cartItems: inStockItems.map((item) => ({
            productId: new Types.ObjectId(item.productId),
            name: item.name,
            price: item.price,
            image: item.image,
            artisanName: item.artisanName,
            quantity: item.quantity,
          })),
        },
      },
      { new: true }
    )
      .select('cartItems role')
      .lean();

    if (!updatedUser) {
      return unauthorized();
    }

    if (updatedUser.role !== 'purchaser') {
      return forbidden();
    }

    const cartItems = Array.isArray(updatedUser.cartItems)
      ? (updatedUser.cartItems as StoredCartItem[])
      : [];

    const items = cartItems.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      price: Number(item.price ?? 0),
      image: item.image ?? '',
      artisanName: item.artisanName ?? '',
      quantity: Number(item.quantity ?? 1),
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: 'Unable to update cart' }, { status: 500 });
  }
}
