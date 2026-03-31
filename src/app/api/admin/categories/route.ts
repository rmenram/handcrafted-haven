import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

const DEFAULT_CATEGORIES = [
  'Home Decor',
  'Jewelry',
  'Kitchen',
  'Pottery & Ceramics',
  'Stationery',
  'Textiles & Fabrics',
];
const TEMP_CATEGORY = 'Temp';
const RESERVED_CATEGORY_NAMES = [...DEFAULT_CATEGORIES, TEMP_CATEGORY];
const categoryImagePathSchema = z
  .string()
  .trim()
  .regex(/^\/images\/[^/]+\.webp$/i, 'Image must be a .webp file in /images');

const updateCategorySchema = z
  .object({
    action: z.literal('rename'),
    oldName: z.string().trim().min(2),
    newName: z.string().trim().min(2),
    image: categoryImagePathSchema.optional(),
  })
  .or(
    z.object({
      action: z.literal('add'),
      name: z.string().trim().min(2),
      image: categoryImagePathSchema,
    })
  )
  .or(
    z.object({
      action: z.literal('delete'),
      name: z.string().trim().min(2),
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
  const categories = await Product.aggregate<{
    name: string;
    lowerName: string;
    productCount: number;
  }>([
    {
      $group: {
        _id: { $toLower: { $trim: { input: '$category' } } },
        name: { $first: '$category' },
        productCount: { $sum: 1 },
      },
    },
    {
      $project: {
        lowerName: '$_id',
        name: '$name',
        productCount: 1,
        _id: 0,
      },
    },
  ]);

  const mergedCounts = new Map<string, { name: string; productCount: number; image: string }>();
  const persistedCategories = await Category.find({}).select('name lowerName image').lean();

  for (const category of persistedCategories) {
    mergedCounts.set(category.lowerName, {
      name: category.name,
      productCount: 0,
      image: category.image ?? '',
    });
  }

  for (const category of categories) {
    const rawName = String(category.name ?? '').trim();
    const lowerName = String(category.lowerName ?? '').trim();
    if (!rawName || !lowerName) {
      continue;
    }

    const existing = mergedCounts.get(lowerName);

    mergedCounts.set(lowerName, {
      name: existing?.name ?? rawName,
      productCount: Number(category.productCount ?? 0),
      image: existing?.image ?? '',
    });
  }

  return Array.from(mergedCounts.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

async function ensureReservedCategories() {
  const operations = RESERVED_CATEGORY_NAMES.map((name) => ({
    updateOne: {
      filter: { lowerName: name.toLowerCase() },
      update: { $setOnInsert: { name, lowerName: name.toLowerCase(), image: '' } },
      upsert: true,
    },
  }));

  await Category.bulkWrite(operations);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET() {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await ensureReservedCategories();
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
    await ensureReservedCategories();

    if (parsed.data.action === 'rename') {
      const oldName = parsed.data.oldName.trim();
      const newName = parsed.data.newName.trim();
      const oldLower = oldName.toLowerCase();
      const newLower = newName.toLowerCase();

      if (oldLower === TEMP_CATEGORY.toLowerCase()) {
        return NextResponse.json({ message: 'Temp category cannot be renamed' }, { status: 400 });
      }

      if (oldLower === newLower) {
        return NextResponse.json({ message: 'Choose a different target name' }, { status: 400 });
      }

      const sourceCategory = await Category.findOne({ lowerName: oldLower }).select('_id').lean();
      if (!sourceCategory) {
        return NextResponse.json({ message: 'Source category not found' }, { status: 404 });
      }

      const duplicateCategory = await Category.findOne({ lowerName: newLower })
        .select('_id')
        .lean();
      if (duplicateCategory) {
        return NextResponse.json({ message: 'Target category already exists' }, { status: 409 });
      }

      await Product.updateMany(
        { category: new RegExp(`^${escapeRegExp(oldName)}$`, 'i') },
        { $set: { category: newName } }
      );

      await Category.updateOne(
        { lowerName: oldLower },
        {
          $set: {
            name: newName,
            lowerName: newLower,
            ...(typeof parsed.data.image === 'string' ? { image: parsed.data.image } : {}),
          },
        }
      );
    }

    if (parsed.data.action === 'add') {
      const name = parsed.data.name.trim();
      const lowerName = name.toLowerCase();
      const existingCategory = await Category.findOne({ lowerName }).select('_id').lean();

      if (existingCategory) {
        return NextResponse.json({ message: 'Category already exists' }, { status: 409 });
      }

      await Category.create({ name, lowerName, image: parsed.data.image ?? '' });
    }

    if (parsed.data.action === 'delete') {
      const sourceName = parsed.data.name.trim();
      const sourceLower = sourceName.toLowerCase();

      if (sourceLower === TEMP_CATEGORY.toLowerCase()) {
        return NextResponse.json({ message: 'Temp category cannot be deleted' }, { status: 400 });
      }

      const sourceCategory = await Category.findOne({ lowerName: sourceLower })
        .select('_id')
        .lean();
      if (!sourceCategory) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
      }

      await Product.updateMany(
        { category: new RegExp(`^${escapeRegExp(sourceName)}$`, 'i') },
        { $set: { category: TEMP_CATEGORY } }
      );

      await Category.deleteOne({ lowerName: sourceLower });
    }

    const categories = await getCategoriesWithCounts();

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ message: 'Unable to update categories' }, { status: 500 });
  }
}
