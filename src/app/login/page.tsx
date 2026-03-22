'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Login failed');
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10'>
      <div className='w-full rounded-lg border border-border bg-card p-6 shadow-sm'>
        <h1 className='text-2xl font-semibold'>Sign in</h1>
        <p className='mt-1 text-sm text-muted-foreground'>Welcome back to Handcrafted Haven.</p>

        <form onSubmit={onSubmit} className='mt-6 space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              Email
            </label>
            <input
              id='email'
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium'>
              Password
            </label>
            <input
              id='password'
              type='password'
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
            />
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='inline-flex h-10 w-full items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className='mt-4 text-sm text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='font-medium text-amber-600 hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
