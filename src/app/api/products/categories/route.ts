import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';

const DEFAULT_CATEGORIES = [
  'Home Decor',
  'Jewelry',
  'Kitchen',
  'Pottery & Ceramics',
  'Stationery',
  'Textiles & Fabrics',
];

export async function GET() {
  try {
    await connectToDatabase();

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

    const mergedCounts = new Map<string, { name: string; productCount: number }>();

    for (const category of DEFAULT_CATEGORIES) {
      mergedCounts.set(category.toLowerCase(), { name: category, productCount: 0 });
    }

    for (const category of categories as Array<{ name?: string; productCount?: number }>) {
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
