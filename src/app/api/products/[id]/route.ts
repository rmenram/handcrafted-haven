import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    const { id } = await context.params;
    
    // Fallback data if DB connection fails
    const fallbackProducts = [
      {
        _id: '1',
        name: 'Handmade Basket',
        price: 25000,
        category: 'Home Decor',
        image: '/images/handmade-basket.webp',
        description: 'Handwoven basket from local artisans.',
        artisanName: 'Artisan One'
      },
      {
        _id: '2',
        name: 'Beaded Necklace',
        price: 15000,
        category: 'Jewelry',
        image: '/images/beaded-necklace.webp',
        description: 'Colorful beaded necklace with organic shells.',
        artisanName: 'Artisan Two'
      },
      {
        _id: '3',
        name: 'Clay Mug Set',
        price: 32000,
        category: 'Kitchen',
        image: '/images/clay-mug-set.webp',
        description: 'Set of 2 rustic ceramic mugs.',
        artisanName: 'Artisan Three'
      },
      {
        _id: '4',
        name: 'Woven Wall Hanging',
        price: 42000,
        category: 'Home Decor',
        image: '/images/woven-wall-hanging.webp',
        description: 'Soft wool wall hanging for cozy interiors.',
        artisanName: 'Artisan Four'
      },
      {
        _id: '5',
        name: 'Ceramic Bowl',
        price: 18000,
        category: 'Kitchen',
        image: '/images/ceramic-bowl.webp',
        description: 'White glazed bowl with handmade imperfections.',
        artisanName: 'Artisan Five'
      }
    ];

    const fallbackProduct = fallbackProducts.find(p => p._id === id);
    if (fallbackProduct) {
      return NextResponse.json({ product: fallbackProduct, error: 'Database connection failed. Showing fallback data.' });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
