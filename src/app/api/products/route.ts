import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({}).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
