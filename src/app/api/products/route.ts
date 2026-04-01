import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.trim();

    const escapedCategory = category ? category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;

    const filter = escapedCategory ? { category: new RegExp(`^${escapedCategory}$`, 'i') } : {};

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('API Error /api/products:', error);
    
    // Fallback data for demonstration if DB connection fails
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

    return NextResponse.json({ products: fallbackProducts, error: 'Database connection failed. Showing fallback data.' });
  }
}
