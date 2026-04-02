'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function WishlistPageClient() {
  const { wishlistItems, addToCart, removeFromWishlist, isCartEnabled } = useCart();

  if (!isCartEnabled) {
    return null;
  }

  if (wishlistItems.length === 0) {
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
          {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className='grid gap-4'>
        {wishlistItems.map((item) => (
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
                <p className='text-sm text-muted-foreground'>
                  by {item.product.artisanName ?? 'Unknown artisan'}
                </p>
                <p className='text-base font-semibold'>${item.product.price.toFixed(2)}</p>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                  onClick={() =>
                    addToCart(
                      {
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.image,
                        artisanName: item.product.artisanName,
                      },
                      1
                    )
                  }
                >
                  <ShoppingCart className='mr-2 h-4 w-4' />
                  Add to Cart
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
