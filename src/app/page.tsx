import FeaturedProducts from '@/components/home/FeaturedProducts';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import BrowseByCategory from '@/components/home/BrowseByCategory';

export const dynamic = 'force-dynamic';

type FeaturedProductViewModel = {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating: number;
  reviews: number;
  seller: string;
  featured?: boolean;
};

async function getFeaturedProducts(): Promise<FeaturedProductViewModel[]> {
  try {
    await connectToDatabase();

    const products = await Product.find({ inStock: true, featured: true })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();

    return products.map((product) => ({
      id: String(product._id),
      name: product.name,
      price: Number(product.price ?? 0),
      image: product.image,
      rating: Number(product.rating ?? 0),
      reviews: Number(product.reviewCount ?? 0),
      seller: product.artisanName ?? 'Handcrafted Haven',
      featured: Boolean(product.featured),
    }));
  } catch {
    return [];
  }
}

//Browse by category functions:
type CategoryViewModel = {
  name: string;
  productCount: number;
};

async function getCategories(): Promise<CategoryViewModel[]> {
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

    return categories;
  } catch {
    return [];
  }
}


export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <section className='space-y-8'>
      <section className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>Landing Page</h1>
        <p className='text-slate-600'>
          Base shell is ready. Next step is building real Header and Footer components.
        </p>
      </section>

      <FeaturedProducts products={featuredProducts} />

      <BrowseByCategory categories={categories} />

    </section>
  );
}
