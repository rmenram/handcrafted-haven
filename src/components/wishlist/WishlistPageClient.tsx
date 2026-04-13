'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

type ProductMeta = {
  artisanName?: string;
  stockQuantity?: number;
  inStock?: boolean;
};

export default function WishlistPageClient() {
  const { wishlistItems, addToCart, removeFromWishlist, isCartEnabled } = useCart();
  const [productMetaById, setProductMetaById] = useState<Record<string, ProductMeta>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadProductMeta() {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          products?: Array<{
            _id: string;
            artisanName?: string;
            stockQuantity?: number;
            inStock?: boolean;
          }>;
        };

        if (!isMounted || !Array.isArray(data.products)) {
          return;
        }

        const nextMeta = data.products.reduce<Record<string, ProductMeta>>((acc, product) => {
          acc[product._id] = {
            artisanName: product.artisanName,
            stockQuantity: Number(product.stockQuantity ?? (product.inStock ? 1 : 0)),
            inStock: Boolean(product.stockQuantity ?? (product.inStock ? 1 : 0)),
          };
          return acc;
        }, {});

        setProductMetaById(nextMeta);
      } catch {
        // Keep wishlist usable even if product metadata cannot be refreshed.
      }
    }

    void loadProductMeta();

    return () => {
      isMounted = false;
    };
  }, []);

  const enrichedItems = useMemo(
    () =>
      wishlistItems.map((item) => {
        const meta = productMetaById[item.product.id];
        const resolvedArtisanName =
          item.product.artisanName?.trim() || meta?.artisanName?.trim() || 'Unknown artisan';
        const resolvedStockQuantity =
          typeof meta?.stockQuantity === 'number' ? Number(meta.stockQuantity) : null;
        const isOutOfStock = resolvedStockQuantity !== null && resolvedStockQuantity < 1;

        return {
          item,
          resolvedArtisanName,
          resolvedStockQuantity,
          isOutOfStock,
        };
      }),
    [wishlistItems, productMetaById]
  );

  if (!isCartEnabled) {
    return null;
  }

  if (enrichedItems.length === 0) {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <h1 className='mb-8 text-3xl font-bold'>My Wishlist</h1>

        <div className='mx-auto max-w-md space-y-6 text-center'>
          <div className='inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted'>
            <Heart className='h-12 w-12 text-muted-foreground/70' />
          </div>
          <h2 className='text-2xl font-bold'>Your wishlist is empty</h2>
          <p className='text-muted-foreground'>
            Save your favorite items by clicking the heart icon on product pages. They&apos;ll
            appear here for easy access later!
          </p>
          <Link
            href='/shop'
            className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full px-4 py-10'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>My Wishlist</h1>
        <p className='text-sm text-muted-foreground'>
          {enrichedItems.length} saved {enrichedItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className='grid gap-4'>
        {enrichedItems.map(({ item, resolvedArtisanName, resolvedStockQuantity, isOutOfStock }) => (
          <div
            key={item.product.id}
            className='flex gap-4 rounded-lg border border-border bg-card p-4'
          >
            <div className='flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted'>
              {item.product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className='h-full w-full object-cover'
                />
              ) : (
                <span className='text-xs font-medium text-muted-foreground'>No image</span>
              )}
            </div>

            <div className='flex flex-1 items-center justify-between gap-4'>
              <div className='space-y-1'>
                <Link
                  href={`/shop/${item.product.id}`}
                  className='font-semibold hover:text-amber-600'
                >
                  {item.product.name}
                </Link>
                <p className='text-sm text-muted-foreground'>by {resolvedArtisanName}</p>
                <p className='text-base font-semibold'>${item.product.price.toFixed(2)}</p>
                {isOutOfStock && <p className='text-sm font-semibold text-red-600'>Out of stock</p>}
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300'
                  onClick={() =>
                    addToCart(
                      {
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.image,
                        artisanName: resolvedArtisanName,
                        stockQuantity: resolvedStockQuantity ?? undefined,
                      },
                      1
                    )
                  }
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className='mr-2 h-4 w-4' />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  type='button'
                  className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-red-600 transition-colors hover:bg-red-50'
                  onClick={() => removeFromWishlist(item.product.id)}
                  aria-label={`Remove ${item.product.name} from wishlist`}
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
