'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    router.push(`/shop?search=${encodeURIComponent(normalizedQuery)}`);
  };

  return (
    <div className='mt-6 flex justify-center'>
      <div className='w-full max-w-md'>
        <p className='mb-2 text-center text-xs text-muted-foreground'>
          Can&apos;t find what you&apos;re looking for?
        </p>

        <div className='flex items-center rounded-lg border bg-input-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring'>
          <input
            type='text'
            placeholder='Search products...'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}
            className='flex-1 bg-transparent text-sm outline-none'
          />

          <button
            type='button'
            onClick={handleSearch}
            className='text-sm text-muted-foreground transition hover:text-foreground'
          >
            Search →
          </button>
        </div>
      </div>
    </div>
  );
}
