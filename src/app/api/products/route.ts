import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url); //to generate the URL for categories Browse by category
    const category = searchParams.get('category');

    const filter = category
      ? { category: new RegExp(`^${category}$`, 'i') }
      : {};

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
