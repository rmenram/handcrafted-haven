import Image from 'next/image';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import SearchBar from '@/components/SearchBarCategories';

const TEMP_CATEGORY = 'Temp';

const DEFAULT_CATEGORIES = [
  'Home Decor',
  'Jewelry',
  'Kitchen',
  'Pottery & Ceramics',
  'Stationery',
  'Textiles & Fabrics',
  'Top Rated',
];

const categoryImages: Record<string, string> = {
  'Home Decor': '/images/home-decor.webp',
  Jewelry: '/images/jewelry.webp',
  Kitchen: '/images/kitchen.webp',
  'Pottery & Ceramics': '/images/ceramics.webp',
  Stationery: '/images/stationery.webp',
  'Textiles & Fabrics': '/images/textiles.webp',
};

const categoryDescriptions: Record<string, string> = {
  'Home Decor': 'Handcrafted home decor items and accessories',
  Jewelry: 'Unique handcrafted necklaces, rings, and bracelets',
  Kitchen: 'Artisan kitchen tools, dishes, and cookware',
  'Pottery & Ceramics': 'Handcrafted bowls, mugs, and decorative pieces',
  Stationery: 'Beautiful handmade paper and writing supplies',
  'Textiles & Fabrics': 'Handwoven scarves, blankets, and tapestries',
  'Top Rated': 'The most good rated products',
};

type CategoryViewModel = {
  name: string;
  productCount: number;
  image?: string;
};

async function getCategories(): Promise<CategoryViewModel[]> {
  try {
    await connectToDatabase();

    const dbCategories = await Category.find({ lowerName: { $ne: TEMP_CATEGORY.toLowerCase() } })
      .select('name lowerName image')
      .lean();

    const categories = await Product.aggregate<{
      name: string;
      lowerName: string;
      productCount: number;
    }>([
      {
        $match: {
          category: { $not: new RegExp(`^${TEMP_CATEGORY}$`, 'i') },
        },
      },
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$category' } } },
          name: { $first: '$category' },
          productCount: { $sum: 1 },
        },
      },
      {
        $project: {
          lowerName: '$_id',
          name: '$name',
          productCount: 1,
          _id: 0,
        },
      },
    ]);

    const mergedCounts = new Map<string, { name: string; productCount: number; image: string }>();

    for (const category of DEFAULT_CATEGORIES) {
      mergedCounts.set(category.toLowerCase(), { name: category, productCount: 0, image: '' });
    }

    for (const category of dbCategories) {
      mergedCounts.set(category.lowerName, {
        name: category.name,
        productCount: 0,
        image: category.image ?? '',
      });
    }

    for (const category of categories) {
      const rawName = String(category.name ?? '').trim();
      const lowerName = String(category.lowerName ?? '').trim();
      if (!rawName || !lowerName || rawName.toLowerCase() === TEMP_CATEGORY.toLowerCase()) {
        continue;
      }

      const existing = mergedCounts.get(lowerName);

      mergedCounts.set(lowerName, {
        name: existing?.name ?? rawName,
        productCount: Number(category.productCount ?? 0),
        image: existing?.image ?? '',
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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className='mx-auto max-w-6xl space-y-8 px-4 py-12'>
      <div className='text-center mb-10'>
        <h1 className='text-3xl font-bold'>Browse by Category</h1>
        <p className='text-slate-600'>
          Explore our diverse collection of handcrafted items organized by craft type. Each category
          features unique pieces from talented artisans around the world.
        </p>
      </div>
      <div className='grid md:grid-cols-3 gap-6'>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/category/${encodeURIComponent(category.name)}`}
            className='group relative rounded-xl overflow-hidden shadow-lg'
          >
            <div className='aspect-[4/3] relative'>
              <Image
                src={category.image || categoryImages[category.name] || '/images/home-decor.webp'}
                alt={category.name}
                fill
                className='object-cover group-hover:scale-110 transition duration-500'
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent' />

              <div className='absolute bottom-0 p-5 text-white w-full'>
                <div className='flex flex-col justify-between h-full'>
                  <div>
                    <h2 className='text-2xl font-bold'>{category.name}</h2>
                    <p className='text-sm opacity-80 mb-3'>{categoryDescriptions[category.name]}</p>
                  </div>
                  <div className='flex justify-between items-end'>
                    <p className='text-sm opacity-80'>
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </p>
                    <span className='text-sm font-medium'>Explore →</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <>
        <SearchBar />
      </>

      <section className='rounded-2xl bg-slate-100 px-6 py-14 text-center sm:px-10'>
        <div className='mx-auto max-w-4xl space-y-8'>
          <h2 className='text-3xl font-semibold'>Why Choose Handcrafted?</h2>
          <p className='mx-auto max-w-2xl text-slate-600'>
            Every handcrafted item tells a story. When you purchase from our artisans, you&apos;re
            not just buying a product—you&apos;re supporting traditional craftsmanship, sustainable
            practices, and real people who pour their heart into their work.
          </p>

          <div className='grid gap-8 sm:grid-cols-3'>
            <div className='space-y-2'>
              <p className='text-5xl font-bold text-amber-600'>100%</p>
              <p className='text-sm text-slate-600'>Handmade by skilled artisans</p>
            </div>
            <div className='space-y-2'>
              <p className='text-5xl font-bold text-amber-600'>500+</p>
              <p className='text-sm text-slate-600'>Unique products available</p>
            </div>
            <div className='space-y-2'>
              <p className='text-5xl font-bold text-amber-600'>50+</p>
              <p className='text-sm text-slate-600'>Talented creators worldwide</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
