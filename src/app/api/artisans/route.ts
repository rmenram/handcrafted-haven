import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/Artisan';

export async function GET() {
  try {
    await connectToDatabase();

    // // Fetch all artisans sorted by newest first
    // const artisans = await User.find({})
    //   .sort({ createdAt: -1 })
    //   .lean();

    const artisans = await User.aggregate([
    // Filter for artisans only
    { $match: { role: 'artisan' } },
    {
      $lookup: {
        from: 'products',               // The name of products collection in MongoDB
        localField: '_id',              // Artisan's ID in the users collection
        foreignField: 'artisanUserId',  // The artisan's ID field in products
        as: 'artisanProducts'           // Temp array 
      }
    },
    {
      $addFields: {
        productCount: { $size: '$artisanProducts' }
      }
    },            
    {
      $project: {
        artisanProducts: 0,
      }
    }
  ]);    
    
    return NextResponse.json({ artisans });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch artisans' },
      { status: 500 }
    );
  }
}
