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

export default function ShopClient() {
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist } = useCart();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>(0);
  const [maxPrice, setMaxPrice] = useState<number | ''>(10000);
  const searchQuery = (searchParams.get('search') ?? '').trim().toLowerCase();

  const maxProductPrice = Math.max(...products.map((p) => p.price), 0);
  const dynamicMaxPrice = maxProductPrice > 0 ? Math.ceil(maxProductPrice) : 10000;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      [product.name, product.artisanName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchQuery));

    const minPriceNum = typeof minPrice === 'number' ? minPrice : 0;
    const maxPriceNum = typeof maxPrice === 'number' ? maxPrice : dynamicMaxPrice;
    const matchesPrice = product.price >= minPriceNum && product.price <= maxPriceNum;

    return matchesSearch && matchesPrice;
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
    <>
      <SearchBar />

      {!loading && !error && (
        <div className='mb-8 space-y-4 rounded-lg border border-border bg-card p-6'>
          <h2 className='text-lg font-semibold'>Filter by Price</h2>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
            <div className='flex-1 space-y-2'>
              <label htmlFor='minPrice' className='text-sm font-medium'>
                Min Price
              </label>
              <input
                id='minPrice'
                type='number'
                min='0'
                max={dynamicMaxPrice}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                aria-label='Minimum price filter'
              />
            </div>
            <div className='flex-1 space-y-2'>
              <label htmlFor='maxPrice' className='text-sm font-medium'>
                Max Price
              </label>
              <input
                id='maxPrice'
                type='number'
                min='0'
                max={dynamicMaxPrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                aria-label='Maximum price filter'
              />
            </div>
            <button
              type='button'
              onClick={() => {
                setMinPrice(0);
                setMaxPrice(dynamicMaxPrice);
              }}
              className='inline-flex h-10 items-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted'
              aria-label='Reset price filters'
            >
              Reset
            </button>
          </div>
          {(typeof minPrice === 'number' && minPrice > 0) ||
          (typeof maxPrice === 'number' && maxPrice < dynamicMaxPrice) ? (
            <p className='text-sm text-muted-foreground'>
              Showing products from ${typeof minPrice === 'number' ? minPrice : 0} to $
              {typeof maxPrice === 'number' ? maxPrice : dynamicMaxPrice}
            </p>
          ) : null}
        </div>
      )}

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
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart className='h-4 w-4' />
                    {Number(product.stockQuantity ?? (product.inStock ? 1 : 0)) < 1 ? 'Out' : 'Add'}
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
                    aria-label={`${isInWishlist(product._id) ? 'Remove' : 'Add'} ${product.name} from wishlist`}
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
    </>
  );
}
