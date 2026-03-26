'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Artisans', href: '/artisans' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartItemsCount, isCartEnabled } = useCart();
  const cartItemsCount = getCartItemsCount();

  const navLinkClasses = (href: string) => {
    const isActive = pathname === href;

    return [
      'text-sm font-medium transition-colors',
      isActive ? 'text-amber-600' : 'text-muted-foreground hover:text-amber-600',
    ].join(' ');
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background'>
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600'>
              <span className='text-xl font-bold text-white'>H</span>
            </div>
            <span className='hidden text-xl font-bold text-foreground sm:inline-block'>
              Handcrafted Haven
            </span>
          </Link>

          <nav className='hidden items-center gap-6 md:flex' aria-label='Primary'>
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className={navLinkClasses(item.href)}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='relative hidden lg:flex'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <input
                type='search'
                placeholder='Search products...'
                className='h-10 w-64 rounded-md border border-border bg-input-background pl-10 pr-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-amber-500/30'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Link
              href='/wishlist'
              className='inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
              aria-label='Wishlist'
            >
              <Heart className='h-5 w-5' />
            </Link>

            {isCartEnabled ? (
              <Link
                href='/cart'
                className='relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                aria-label='Shopping cart'
              >
                <ShoppingCart className='h-5 w-5' />
                {cartItemsCount > 0 && (
                  <span className='absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white'>
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            ) : (
              <span
                className='inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground/50'
                aria-label='Cart available to purchaser accounts only'
                title='Cart is only available for purchaser accounts.'
              >
                <ShoppingCart className='h-5 w-5' />
              </span>
            )}

            <Link
              href='/profile'
              className='inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
              aria-label='Account'
            >
              <User className='h-5 w-5' />
            </Link>

            <button
              type='button'
              className='inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden'
              aria-expanded={isOpen}
              aria-controls='mobile-nav'
              aria-label='Toggle navigation menu'
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>
          </div>
        </div>

        {isOpen && (
          <nav
            id='mobile-nav'
            className='border-t border-border py-4 md:hidden'
            aria-label='Mobile primary'
          >
            <div className='flex flex-col space-y-4'>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='text-lg font-medium text-muted-foreground transition-colors hover:text-amber-600'
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
