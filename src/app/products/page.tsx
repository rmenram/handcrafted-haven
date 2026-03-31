'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  artisanName?: string;
  featured?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = (await response.json()) as { products?: Product[] };

        if (isMounted) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className='py-16'>
      <div className='mx-auto max-w-6xl px-4 space-y-8'>
        <header className='space-y-2'>
          <h1 className='text-4xl font-semibold tracking-tight'>All Products</h1>
          <p className='text-slate-600'>
            Explore our full collection of handcrafted items made with passion and creativity.
          </p>
        </header>

        {loading ? (
          <p className='text-slate-600'>Loading products...</p>
        ) : error ? (
          <p className='text-red-600'>Unable to load products: {error}</p>
        ) : products.length === 0 ? (
          <p className='text-slate-600'>No products found.</p>
        ) : (
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {products.map((product) => (
              <article
                key={product._id}
                className='relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='relative aspect-square bg-slate-100'>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className='object-cover'
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
                  <h3 className='text-lg font-medium'>{product.name}</h3>
                  <p className='font-semibold text-slate-600'>${product.price.toFixed(2)}</p>

                  <div className='flex items-center gap-1 text-sm text-slate-700'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    {(product.rating ?? 0).toFixed(1)}
                    <span className='text-slate-500'>({product.reviewCount ?? 0})</span>
                  </div>

                  <p className='text-xs text-slate-500'>
                    by {product.artisanName ?? 'Unknown artisan'}
                  </p>
                </div>

                <button
                  type='button'
                  className='absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600'
                >
                  <ShoppingCart className='h-4 w-4' />
                  Add
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
