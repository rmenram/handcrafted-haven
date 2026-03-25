import Image from 'next/image';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

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
};

async function getProductsForCategory(categoryName: string): Promise<CategoryProductViewModel[]> {
  try {
    await connectToDatabase();

    const escapedCategory = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const products = await Product.find({
      category: new RegExp(`^${escapedCategory}$`, 'i'),
      inStock: true,
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(24)
      .lean();

    return products.map((product) => ({
      id: String(product._id),
      name: product.name,
      image: product.image,
      price: Number(product.price ?? 0),
      artisanName: product.artisanName,
    }));
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const products = await getProductsForCategory(decodedCategory);

  return (
    <section className='mx-auto max-w-6xl space-y-8 px-4 py-12'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>{decodedCategory}</h1>
        <p className='text-slate-600'>Discover handcrafted products in this category.</p>
      </header>

      {products.length === 0 ? (
        <p className='rounded-lg border bg-white p-6 text-slate-600'>
          No in-stock products found in this category right now.
        </p>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((product) => (
            <article
              key={product.id}
              className='overflow-hidden rounded-xl border bg-white shadow-sm'
            >
              <div className='relative aspect-[4/3]'>
                <Image
                  src={product.image || '/images/home-decor.webp'}
                  alt={product.name}
                  fill
                  className='object-cover'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
              </div>
              <div className='space-y-2 p-4'>
                <h2 className='text-lg font-semibold'>{product.name}</h2>
                <p className='text-sm text-slate-600'>By {product.artisanName}</p>
                <p className='text-base font-medium'>${product.price.toFixed(2)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
