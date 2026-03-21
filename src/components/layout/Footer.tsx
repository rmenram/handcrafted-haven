import Link from 'next/link';
import { Facebook, Instagram, Mail, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='mt-auto border-t border-border bg-muted/40'>
      <div className='mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          <div>
            <h3 className='mb-4 font-semibold text-foreground'>About Handcrafted Haven</h3>
            <p className='text-sm text-muted-foreground'>
              A marketplace connecting talented artisans with customers who appreciate unique,
              handmade products.
            </p>
          </div>

          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Quick Links</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/shop' className='text-muted-foreground hover:text-amber-600'>
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href='/artisans' className='text-muted-foreground hover:text-amber-600'>
                  Meet Our Artisans
                </Link>
              </li>
              <li>
                <Link href='/categories' className='text-muted-foreground hover:text-amber-600'>
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href='/about' className='text-muted-foreground hover:text-amber-600'>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Customer Service</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='#' className='text-muted-foreground hover:text-amber-600'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-amber-600'>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-amber-600'>
                  Returns Policy
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-amber-600'>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Stay Connected</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Subscribe to our newsletter for new arrivals and exclusive offers.
            </p>
            <div className='flex gap-4'>
              <a
                href='#'
                className='text-muted-foreground hover:text-amber-600'
                aria-label='Facebook'
              >
                <Facebook className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-muted-foreground hover:text-amber-600'
                aria-label='Instagram'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-muted-foreground hover:text-amber-600'
                aria-label='Twitter'
              >
                <Twitter className='h-5 w-5' />
              </a>
              <a href='#' className='text-muted-foreground hover:text-amber-600' aria-label='Mail'>
                <Mail className='h-5 w-5' />
              </a>
            </div>
          </div>
        </div>

        <div className='mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground'>
          <p>&copy; 2026 Handcrafted Haven. Supporting artisans and sustainable craftsmanship.</p>
        </div>
      </div>
    </footer>
  );
}
