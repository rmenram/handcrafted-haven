import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating: number;
  reviews: number;
  seller: string;
  featured?: boolean;
};

type FeaturedProductsProps = {
  products?: Product[];
};

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  return (
    <section className='py-16'>
      <div className='mx-auto max-w-6xl space-y-8 px-4'>
        <header className='space-y-2'>
          <h2 className='text-3xl font-semibold tracking-tight'>Featured Products</h2>
          <p className='text-slate-600'>
            A curated selection of handcrafted items made with care and creativity.
          </p>
        </header>

        {products.length === 0 ? (
          <p className='text-slate-500'>No featured products available.</p>
        ) : (
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className='relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md block group'
              >
                <div className='relative aspect-square bg-slate-100'>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-sm text-slate-400'>
                      No image
                    </div>
                  )}

                  {product.featured && (
                    <span className='absolute left-3 top-3 rounded-md bg-yellow-400 px-2 py-1 text-xs font-medium text-yellow-900 shadow-sm'>
                      Featured
                    </span>
                  )}
                </div>

                <div className='space-y-3 p-5'>
                  <h3 className='text-lg font-medium group-hover:text-orange-600 transition-colors'>{product.name}</h3>
                  <p className='font-semibold text-slate-600'>${product.price.toFixed(2)}</p>

                  <div className='flex items-center gap-1 text-sm text-slate-700'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    {product.rating.toFixed(1)}
                    <span className='text-slate-500'>({product.reviews})</span>
                  </div>

                  <p className='text-xs text-slate-500'>by {product.seller}</p>
                </div>

                <div
                  className='absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600'
                >
                  <ShoppingCart className='h-4 w-4' />
                  View
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
