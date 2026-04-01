'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = () => {
        if (!query.trim()) return;
        router.push(`/products?search=${encodeURIComponent(query)}`);
    };
    return (
        <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md">
                <p className="mb-2 text-xs text-muted-foreground text-center">
                    Can&apos;t find what you&apos;re looking for?
                </p>

                <div className="flex items-center rounded-lg border bg-input-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                    />

                    <button
                        onClick={handleSearch}
                        className="text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        Search →
                    </button>
                </div>
            </div>
        </div>
    );
}