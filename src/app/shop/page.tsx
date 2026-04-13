import { Suspense } from 'react';
import SkeletonCard from '@/components/SkeletonCard';
import ShopClient from './ShopClient';

function ShopSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='h-12 w-64 animate-pulse rounded bg-muted' />
      <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className='py-16'>
      <div className='mx-auto max-w-6xl px-4 space-y-8'>
        <header className='space-y-2'>
          <h1 className='text-4xl font-semibold tracking-tight'>All Products</h1>
          <p className='text-slate-600'>
            Explore our full collection of handcrafted items made with passion and creativity.
          </p>
        </header>
        <Suspense fallback={<ShopSkeleton />}>
          <ShopClient />
        </Suspense>
      </div>
    </main>
  );
}
