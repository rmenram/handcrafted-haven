import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

const TEMP_CATEGORY = 'Temp';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.trim();
    if (category && category.toLowerCase() === TEMP_CATEGORY.toLowerCase()) {
      return NextResponse.json({ products: [] });
    }

    const escapedCategory = category ? category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;

    const filter = escapedCategory
      ? {
          $and: [
            { category: { $ne: TEMP_CATEGORY } },
            { category: new RegExp(`^${escapedCategory}$`, 'i') },
          ],
        }
      : { category: { $ne: TEMP_CATEGORY } };

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        inStock: Boolean(product.stockQuantity ?? (product.inStock ? 1 : 0)),
        stockQuantity: Number(product.stockQuantity ?? (product.inStock ? 1 : 0)),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
