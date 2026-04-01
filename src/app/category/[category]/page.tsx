import Image from 'next/image';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Link from 'next/link';

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

type CategoryProductViewModel = {
  id: string;
  name: string;
  image: string;
  price: number;
  artisanName: string;
  inStock: boolean;
  rating: number;
};

async function getProductsForCategory(categoryName: string): Promise<CategoryProductViewModel[]> {
  try {
    await connectToDatabase();

    if (categoryName.toLowerCase() === 'top rated') { //search for the top rated function 4 to 5 points products only
      const products = await Product.find({
        rating: { $gte: 4 },
      })
        .sort({ rating: -1 }) //
        .limit(24)
        .lean();

      return products.map((product) => ({
        id: String(product._id),
        name: product.name,
        image: product.image,
        price: Number(product.price ?? 0),
        rating: Number(product.rating ?? 0),
        artisanName: product.artisanName,
        inStock: Boolean(product.inStock),
      }));
    }

    const escapedCategory = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const products = await Product.find({
      category: new RegExp(`^${escapedCategory}$`, 'i'),
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(24)
      .lean();

    return products.map((product) => ({
      id: String(product._id),
      name: product.name,
      image: product.image,
      price: Number(product.price ?? 0),
      rating: Number(product.rating ?? 0),
      artisanName: product.artisanName,
      inStock: Boolean(product.inStock),
    }));
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const products = await getProductsForCategory(decodedCategory);
  const isTopRated = decodedCategory.toLowerCase() === 'top rated';

  return (
    <section className='mx-auto max-w-6xl space-y-8 px-4 py-12'>
      <Link href="/categories" className="inline-block text-sm hover:underline"> {/* Button for back to categories page after browse by category */} 
        ← Back to categories
      </Link>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>{decodedCategory}</h1>
        <p className='text-slate-600'>Discover handcrafted products in this category.</p>
      </header>

      {products.length === 0 ? (
        <p className='rounded-lg border bg-white p-6 text-slate-600'>
          No products found in this category right now.
        </p>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((product) => (
            <article
              key={product.id}
              className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-opacity ${
                product.inStock ? '' : 'opacity-75'
              }`}
            >
              <div className='relative aspect-[4/3]'>
                <Image
                  src={product.image || '/images/home-decor.webp'}
                  alt={product.name}
                  fill
                  className={`object-cover ${product.inStock ? '' : 'grayscale'}`}
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
                {!product.inStock && (
                  <span className='absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow'>
                    Out of stock
                  </span>
                )}
              </div>
              <div className='space-y-2 p-4'>
                <h2 className='text-lg font-semibold'>{product.name}</h2>
                <p className='text-sm text-slate-600'>By {product.artisanName}</p>
                {/* for Top Rated only */}
                {isTopRated && (
                  <p className="text-sm flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="text-slate-700">
                      {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
                    </span>
                  </p>
                )}           
                <p className='text-base font-medium'>${product.price.toFixed(2)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
