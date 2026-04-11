'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBarCategories';
import { useCart } from '@/context/CartContext';
import SkeletonCard from '@/components/SkeletonCard';

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  artisanName?: string;
  featured?: boolean;
};

export default function ShopPage() {
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist } = useCart();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = (searchParams.get('search') ?? '').trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) {
      return true;
    }

    return [product.name, product.artisanName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchQuery));
  });

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
        <SearchBar />

        {loading ? (
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <p className='text-red-600'>Unable to load products: {error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className='text-slate-600'>
            {searchQuery
              ? `No products matched "${searchParams.get('search') ?? ''}".`
              : 'No products found.'}
          </p>
        ) : (
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredProducts.map((product) => (
              <article
                key={product._id}
                className='relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md'
              >
                <Link href={`/shop/${product._id}`} className='block'>
                  <div className='relative aspect-square bg-slate-100'>
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={`object-cover ${Number(product.stockQuantity ?? 0) < 1 ? 'grayscale' : ''}`}
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

                    {Number(product.stockQuantity ?? 0) < 1 && (
                      <span className='absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm'>
                        Out of stock
                      </span>
                    )}

                    {Number(product.stockQuantity ?? 0) > 0 &&
                      Number(product.stockQuantity ?? 0) <= 5 && (
                        <span className='absolute right-3 top-3 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 shadow-sm'>
                          Only {Number(product.stockQuantity ?? 0)} left
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
                </Link>

                {isCartEnabled && (
                  <>
                    <button
                      type='button'
                      className='absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600'
                      onClick={() =>
                        addToCart({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          artisanName: product.artisanName,
                        })
                      }
                      disabled={Number(product.stockQuantity ?? (product.inStock ? 1 : 0)) < 1}
                    >
                      <ShoppingCart className='h-4 w-4' />
                      {Number(product.stockQuantity ?? (product.inStock ? 1 : 0)) < 1
                        ? 'Out'
                        : 'Add'}
                    </button>

                    <button
                      type='button'
                      className='absolute bottom-4 right-24 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50'
                      onClick={() =>
                        toggleWishlist({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          artisanName: product.artisanName,
                        })
                      }
                      aria-label={`Toggle ${product.name} in wishlist`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-slate-500'
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
    </main>
  );
}
