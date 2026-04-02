import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { Types } from 'mongoose';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

type StoredWishlistItem = {
  productId: Types.ObjectId | string;
  name: string;
  price: number;
  image?: string;
  artisanName?: string;
};

const wishlistItemSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  image: z.string().trim().default(''),
  artisanName: z.string().trim().default(''),
});

const updateWishlistSchema = z.object({
  items: z.array(wishlistItemSchema),
});

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ message: 'Only purchasers can access wishlist' }, { status: 403 });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return unauthorized();
    }

    const payload = verifyAuthToken(token);
    if (payload.role !== 'purchaser') {
      return forbidden();
    }

    await connectToDatabase();

    const user = await User.findById(payload.sub).select('wishlistItems role').lean();
    if (!user) {
      return unauthorized();
    }

    if (user.role !== 'purchaser') {
      return forbidden();
    }

    const wishlistItems = Array.isArray(user.wishlistItems)
      ? (user.wishlistItems as StoredWishlistItem[])
      : [];

    const items = wishlistItems.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      price: Number(item.price ?? 0),
      image: item.image ?? '',
      artisanName: item.artisanName ?? '',
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: 'Unable to load wishlist' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return unauthorized();
    }

    const payload = verifyAuthToken(token);
    if (payload.role !== 'purchaser') {
      return forbidden();
    }

    const body = await request.json();
    const parsed = updateWishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid wishlist payload' }, { status: 400 });
    }

    const validItems = parsed.data.items.filter((item) => Types.ObjectId.isValid(item.productId));

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      payload.sub,
      {
        $set: {
          wishlistItems: validItems.map((item) => ({
            productId: new Types.ObjectId(item.productId),
            name: item.name,
            price: item.price,
            image: item.image,
            artisanName: item.artisanName,
          })),
        },
      },
      { new: true }
    )
      .select('wishlistItems role')
      .lean();

    if (!updatedUser) {
      return unauthorized();
    }

    if (updatedUser.role !== 'purchaser') {
      return forbidden();
    }

    const wishlistItems = Array.isArray(updatedUser.wishlistItems)
      ? (updatedUser.wishlistItems as StoredWishlistItem[])
      : [];

    const items = wishlistItems.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      price: Number(item.price ?? 0),
      image: item.image ?? '',
      artisanName: item.artisanName ?? '',
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: 'Unable to update wishlist' }, { status: 500 });
  }
}
