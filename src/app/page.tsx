import FeaturedProducts from '@/components/home/FeaturedProducts';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

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

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className='space-y-8'>
      <section className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>Landing Page</h1>
        <p className='text-slate-600'>
          Base shell is ready. Next step is building real Header and Footer components.
        </p>
      </section>

      <FeaturedProducts products={featuredProducts} />
    </section>
  );
}
