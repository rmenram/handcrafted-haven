'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  Lock,
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Tags,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Artisans', href: '/artisans' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
];

type AuthUser = {
  id: string;
  role: 'purchaser' | 'artisan' | 'admin';
};

type MenuItem = {
  label: string;
  href: string;
  icon: typeof User;
};

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { getCartItemsCount, wishlistItems, isCartEnabled } = useCart();
  const cartItemsCount = getCartItemsCount();
  const wishlistItemsCount = wishlistItems.length;

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch('/api/users/me', { cache: 'no-store' });

        if (!isMounted) return;

        if (!response.ok) {
          setAuthUser(null);
          return;
        }

        const data = (await response.json()) as { user?: AuthUser };
        setAuthUser(data.user ?? null);
      } catch {
        if (isMounted) {
          setAuthUser(null);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current) return;
      if (profileMenuRef.current.contains(event.target as Node)) return;
      setIsProfileMenuOpen(false);
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const profileMenuItems = useMemo<MenuItem[]>(() => {
    if (authUser?.role === 'admin') {
      return [
        { label: 'Profile', href: '/profile?tab=profile', icon: User },
        { label: 'Products', href: '/profile?tab=products', icon: Package },
        { label: 'Users', href: '/profile?tab=users', icon: Users },
        { label: 'Categories', href: '/profile?tab=categories', icon: Tags },
        { label: 'Settings', href: '/profile?tab=settings', icon: Settings },
      ];
    }

    if (authUser?.role === 'artisan') {
      return [
        { label: 'Profile', href: '/profile?tab=profile', icon: User },
        { label: 'Products', href: '/profile?tab=products', icon: Package },
        { label: 'Settings', href: '/profile?tab=settings', icon: Settings },
      ];
    }

    return [
      { label: 'Profile', href: '/profile?tab=profile', icon: User },
      { label: 'Orders', href: '/profile?tab=orders', icon: Package },
      { label: 'Wishlist', href: '/profile?tab=wishlist', icon: Heart },
      { label: 'Settings', href: '/profile?tab=settings', icon: Settings },
    ];
  }, [authUser?.role]);

  async function handleProfileMenuLogout() {
    await fetch('/api/users/logout', { method: 'POST' });
    setAuthUser(null);
    setIsProfileMenuOpen(false);
    window.location.href = '/';
  }

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

            {isCartEnabled ? (
              <Link
                href='/wishlist'
                className='relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                aria-label='Wishlist'
              >
                <Heart className='h-5 w-5' />
                {wishlistItemsCount > 0 && (
                  <span className='absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white'>
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>
            ) : (
              <span
                className='relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground/50'
                aria-label='Wishlist available to purchaser accounts only'
                title='Wishlist is only available for purchaser accounts.'
              >
                <Heart className='h-5 w-5' />
                <span className='absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                  <Lock className='h-2.5 w-2.5' />
                </span>
              </span>
            )}

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
                className='relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground/50'
                aria-label='Cart available to purchaser accounts only'
                title='Cart is only available for purchaser accounts.'
              >
                <ShoppingCart className='h-5 w-5' />
                <span className='absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                  <Lock className='h-2.5 w-2.5' />
                </span>
              </span>
            )}

            <div className='relative' ref={profileMenuRef}>
              <button
                type='button'
                className='inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                aria-label='Account menu'
                aria-haspopup='menu'
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <User className='h-5 w-5' />
              </button>

              {isProfileMenuOpen && (
                <div className='absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-background p-1.5 shadow-lg'>
                  {authUser ? (
                    <>
                      {profileMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent'
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Icon className='h-4 w-4 text-muted-foreground' />
                            {item.label}
                          </Link>
                        );
                      })}

                      <button
                        type='button'
                        onClick={handleProfileMenuLogout}
                        className='mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent'
                      >
                        <LogOut className='h-4 w-4 text-muted-foreground' />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href='/login'
                        className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent'
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <LogIn className='h-4 w-4 text-muted-foreground' />
                        Sign In
                      </Link>
                      <Link
                        href='/signup'
                        className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent'
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <UserPlus className='h-4 w-4 text-muted-foreground' />
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

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
