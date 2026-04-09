'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'purchaser' | 'artisan'>(
    (searchParams.get('role') as 'purchaser' | 'artisan') || 'purchaser'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const registerResponse = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        setError(registerData.message ?? 'Registration failed');
        return;
      }

      const loginResponse = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        setError(loginData.message ?? 'Registration succeeded but login failed');
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
        <h1 className='text-2xl font-semibold'>Create account</h1>
        <p className='mt-1 text-sm text-muted-foreground'>Join Handcrafted Haven.</p>

        <form onSubmit={onSubmit} className='mt-6 space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium'>
              Full name
            </label>
            <input
              id='name'
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
            />
          </div>

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

          <div className='space-y-2'>
            <label htmlFor='role' className='text-sm font-medium'>
              Account type
            </label>
            <select
              id='role'
              value={role}
              onChange={(e) => setRole(e.target.value as 'purchaser' | 'artisan')}
              className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
            >
              <option value='purchaser'>Purchaser</option>
              <option value='artisan'>Artisan</option>
            </select>
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='inline-flex h-10 w-full items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className='mt-4 text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/login' className='font-medium text-amber-600 hover:underline'>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
