import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';
import WishlistPageClient from '@/components/wishlist/WishlistPageClient';

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center'>
          <h2 className='text-2xl font-bold'>Wishlist unavailable</h2>
          <p className='text-muted-foreground'>
            Sign in as a purchaser to save and manage wishlist items.
          </p>
          <div className='flex items-center justify-center gap-3'>
            <Link
              href='/login'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              Sign In
            </Link>
            <Link
              href='/'
              className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let wishlistAccess: 'purchaser' | 'non-purchaser' | 'invalid-session' = 'invalid-session';

  try {
    const payload = verifyAuthToken(token);
    wishlistAccess = payload.role === 'purchaser' ? 'purchaser' : 'non-purchaser';
  } catch {
    wishlistAccess = 'invalid-session';
  }

  if (wishlistAccess === 'invalid-session') {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 text-center'>
          <h2 className='text-2xl font-bold'>Wishlist unavailable</h2>
          <p className='text-muted-foreground'>Your session is invalid. Please sign in again.</p>
          <Link
            href='/login'
            className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (wishlistAccess === 'non-purchaser') {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center'>
          <h2 className='text-2xl font-bold'>Wishlist unavailable</h2>
          <p className='text-muted-foreground'>Only purchaser accounts can use the wishlist.</p>
          <div className='flex items-center justify-center gap-3'>
            <Link
              href='/profile'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              Go to Profile
            </Link>
            <Link
              href='/'
              className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <WishlistPageClient />;
}
