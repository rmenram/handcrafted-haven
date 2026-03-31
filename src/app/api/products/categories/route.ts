import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
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

export async function GET() {
  try {
    await connectToDatabase();

    const dbCategories = await Category.find({ lowerName: { $ne: TEMP_CATEGORY.toLowerCase() } })
      .select('name lowerName image')
      .lean();

    const categories = await Product.aggregate<{
      name: string;
      lowerName: string;
      productCount: number;
    }>([
      {
        $match: {
          category: { $not: new RegExp(`^${TEMP_CATEGORY}$`, 'i') },
        },
      },
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

    for (const category of DEFAULT_CATEGORIES) {
      mergedCounts.set(category.toLowerCase(), { name: category, productCount: 0, image: '' });
    }

    for (const category of dbCategories) {
      mergedCounts.set(category.lowerName, {
        name: category.name,
        productCount: 0,
        image: category.image ?? '',
      });
    }

    for (const category of categories) {
      const rawName = String(category.name ?? '').trim();
      const lowerName = String(category.lowerName ?? '').trim();
      if (!rawName || !lowerName || rawName.toLowerCase() === TEMP_CATEGORY.toLowerCase()) {
        continue;
      }

      const existing = mergedCounts.get(lowerName);

      mergedCounts.set(lowerName, {
        name: existing?.name ?? rawName,
        productCount: Number(category.productCount ?? 0),
        image: existing?.image ?? '',
      });
    }

    const response = Array.from(mergedCounts.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    return NextResponse.json(response);
  } catch {
    const fallback = DEFAULT_CATEGORIES.map((name) => ({ name, productCount: 0 })).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    return NextResponse.json(fallback);
  }
}
