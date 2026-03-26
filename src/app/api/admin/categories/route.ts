import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

const DEFAULT_CATEGORIES = [
  'Home Decor',
  'Jewelry',
  'Kitchen',
  'Pottery & Ceramics',
  'Stationery',
  'Textiles & Fabrics',
];

const updateCategorySchema = z
  .object({
    action: z.literal('rename'),
    oldName: z.string().trim().min(2),
    newName: z.string().trim().min(2),
  })
  .or(
    z.object({
      action: z.literal('delete'),
      name: z.string().trim().min(2),
      replacementName: z.string().trim().min(2),
    })
  );

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

async function getCategoriesWithCounts() {
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
      },
    },
    {
      $project: {
        name: '$_id',
        productCount: 1,
        _id: 0,
      },
    },
  ]);

  const mergedCounts = new Map();

  for (const category of DEFAULT_CATEGORIES) {
    mergedCounts.set(category.toLowerCase(), { name: category, productCount: 0 });
  }

  for (const category of categories) {
    const rawName = String(category.name ?? '').trim();
    if (!rawName) {
      continue;
    }

    const key = rawName.toLowerCase();
    const existing = mergedCounts.get(key);

    mergedCounts.set(key, {
      name: existing?.name ?? rawName,
      productCount: Number(category.productCount ?? 0),
    });
  }

  return Array.from(mergedCounts.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

export async function GET() {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const categories = await getCategoriesWithCounts();

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ message: 'Unable to load categories' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid category update payload' }, { status: 400 });
    }

    await connectToDatabase();

    if (parsed.data.action === 'rename') {
      await Product.updateMany(
        { category: parsed.data.oldName },
        { $set: { category: parsed.data.newName } }
      );
    }

    if (parsed.data.action === 'delete') {
      if (parsed.data.name === parsed.data.replacementName) {
        return NextResponse.json(
          { message: 'Replacement category must be different' },
          { status: 400 }
        );
      }

      await Product.updateMany(
        { category: parsed.data.name },
        { $set: { category: parsed.data.replacementName } }
      );
    }

    const categories = await getCategoriesWithCounts();

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ message: 'Unable to update categories' }, { status: 500 });
  }
}
