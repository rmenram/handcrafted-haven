'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

const TEMP_CATEGORY = 'Temp';

type CategoryProductViewModel = {
  _id: string;
  name: string;
  image: string;
  price: number;
  artisanName: string;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviewCount: number;
  category: string;
  featured?: boolean;
};

async function getProductsForCategory(categoryName: string): Promise<CategoryProductViewModel[]> {
  try {
    if (categoryName.toLowerCase() === TEMP_CATEGORY.toLowerCase()) {
      return [];
    }

    if (categoryName.toLowerCase() === 'top rated') {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products`,
        {
          cache: 'no-store',
        }
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { products?: CategoryProductViewModel[] };
      return (data.products ?? [])
        .filter((p) => (p.rating ?? 0) >= 4)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 24);
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products?category=${encodeURIComponent(categoryName)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: CategoryProductViewModel[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const [decodedCategory, setDecodedCategory] = useState('');
  const [products, setProducts] = useState<CategoryProductViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const { category } = await params;
      const decoded = decodeURIComponent(category);
      setDecodedCategory(decoded);

      const prods = await getProductsForCategory(decoded);
      setProducts(prods);
      setLoading(false);
    }

    void loadProducts();
  }, [params]);

  return (
    <section className='mx-auto max-w-6xl space-y-8 px-4 py-12'>
      <Link href='/categories' className='inline-block text-sm hover:underline'>
        ← Back to categories
      </Link>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>{decodedCategory}</h1>
        <p className='text-slate-600'>Discover handcrafted products in this category.</p>
      </header>

      {loading ? (
        <p className='text-slate-600'>Loading products...</p>
      ) : products.length === 0 ? (
        <p className='rounded-lg border bg-white p-6 text-slate-600'>
          No products found in this category right now.
        </p>
      ) : (
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((product) => {
            const stockQuantity = Number(product.stockQuantity ?? (product.inStock ? 1 : 0));
            const isOutOfStock = stockQuantity < 1;
            const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

            return (
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
                        className={`object-cover ${isOutOfStock ? 'grayscale' : ''}`}
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

                    {isOutOfStock && (
                      <span className='absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm'>
                        Out of stock
                      </span>
                    )}

                    {isLowStock && (
                      <span className='absolute right-3 top-3 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 shadow-sm'>
                        Only {stockQuantity} left
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
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className='h-4 w-4' />
                      {isOutOfStock ? 'Out' : 'Add'}
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
            );
          })}
        </div>
      )}
    </section>
  );
}
