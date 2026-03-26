import Link from 'next/link';
import { cookies } from 'next/headers';
import CartPageClient from '@/components/cart/CartPageClient';
import { verifyAuthToken } from '@/lib/auth';

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center'>
          <h2 className='text-2xl font-bold'>Cart unavailable</h2>
          <p className='text-muted-foreground'>
            Sign in as a purchaser to use the cart and checkout.
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

  let cartAccess: 'purchaser' | 'non-purchaser' | 'invalid-session' = 'invalid-session';

  try {
    const payload = verifyAuthToken(token);
    cartAccess = payload.role === 'purchaser' ? 'purchaser' : 'non-purchaser';
  } catch {
    cartAccess = 'invalid-session';
  }

  if (cartAccess === 'invalid-session') {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 text-center'>
          <h2 className='text-2xl font-bold'>Cart unavailable</h2>
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

  if (cartAccess === 'non-purchaser') {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center'>
          <h2 className='text-2xl font-bold'>Cart unavailable</h2>
          <p className='text-muted-foreground'>
            Only purchaser accounts can use the shopping cart and checkout.
          </p>
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

  return <CartPageClient />;
}
