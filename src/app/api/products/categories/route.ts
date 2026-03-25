import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
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

  return NextResponse.json(categories);
}