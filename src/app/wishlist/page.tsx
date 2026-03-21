import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className='mx-auto w-full px-4 py-16'>
      <h1 className='mb-8 text-3xl font-bold'>My Wishlist</h1>

      <div className='mx-auto max-w-md space-y-6 text-center'>
        <div className='inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted'>
          <Heart className='h-12 w-12 text-muted-foreground/70' />
        </div>
        <h2 className='text-2xl font-bold'>Your wishlist is empty</h2>
        <p className='text-muted-foreground'>
          Save your favorite items by clicking the heart icon on product pages. They&apos;ll appear
          here for easy access later!
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
