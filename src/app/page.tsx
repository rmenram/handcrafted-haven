import FeaturedProducts from '@/components/home/FeaturedProducts';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import BrowseByCategory from '@/components/home/BrowseByCategory';
import CallToAction from '@/components/home/CallToAction';

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

const DEFAULT_CATEGORIES = [
  'Home Decor',
  'Jewelry',
  'Kitchen',
  'Pottery & Ceramics',
  'Stationery',
  'Textiles & Fabrics',
];

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

    return Array.from(mergedCounts.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  } catch {
    return DEFAULT_CATEGORIES.map((name) => ({ name, productCount: 0 })).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
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

      <CallToAction />
    </section>
  );
}
