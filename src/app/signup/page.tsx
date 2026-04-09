import { Suspense } from 'react';
import SignupForm from './SignupForm';

function SignupSkeleton() {
  return (
    <div className='mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10'>
      <div className='w-full rounded-lg border border-border bg-card p-6 shadow-sm'>
        <div className='h-8 w-32 animate-pulse rounded bg-muted' />
        <div className='mt-1 h-4 w-48 animate-pulse rounded bg-muted' />
        <div className='mt-6 space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <div className='h-4 w-16 animate-pulse rounded bg-muted' />
              <div className='h-10 w-full animate-pulse rounded bg-muted' />
            </div>
          ))}
          <div className='h-10 w-full animate-pulse rounded bg-muted' />
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
