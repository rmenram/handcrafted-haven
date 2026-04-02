'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  stockQuantity?: number;
  rating: number;
  reviews: number;
  seller: string;
  featured?: boolean;
};

type FeaturedProductsProps = {
  products?: Product[];
};

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist } = useCart();

  return (
    <section className='py-2'>
      <div className='mx-auto max-w-6xl space-y-8 px-4'>
        <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-semibold tracking-tight'>Featured Products</h2>
            <p className='text-slate-600'>
              A curated selection of handcrafted items made with care and creativity.
            </p>
          </div>
          <Link
            href='/shop'
            className='inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100'
          >
            View all products
          </Link>
        </header>

        {products.length === 0 ? (
          <p className='text-slate-500'>No featured products available.</p>
        ) : (
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {products.map((product) => (
              <article
                key={product.id}
                className='relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md'
              >
                {Number(product.stockQuantity ?? 0) > 0 &&
                  Number(product.stockQuantity ?? 0) <= 5 && (
                    <span className='absolute right-3 top-3 z-10 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 shadow-sm'>
                      Only {Number(product.stockQuantity ?? 0)} left
                    </span>
                  )}

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
                    {product.rating.toFixed(1)}
                    <span className='text-slate-500'>({product.reviews})</span>
                  </div>

                  <p className='text-xs text-slate-500'>by {product.seller}</p>
                </div>

                {isCartEnabled && (
                  <>
                    <button
                      type='button'
                      className='absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600'
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          artisanName: product.seller,
                        })
                      }
                      disabled={Number(product.stockQuantity ?? 0) < 1}
                    >
                      <ShoppingCart className='h-4 w-4' />
                      {Number(product.stockQuantity ?? 0) < 1 ? 'Out' : 'Add'}
                    </button>

                    <button
                      type='button'
                      className='absolute bottom-4 right-24 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50'
                      onClick={() =>
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          artisanName: product.seller,
                        })
                      }
                      aria-label={`Toggle ${product.name} in wishlist`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
