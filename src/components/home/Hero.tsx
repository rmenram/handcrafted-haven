import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className='w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-amber-50'>
      <div className='mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center'>
          {/* Left Content */}
          <div className='space-y-6'>
            <h1 className='text-5xl font-bold tracking-tight leading-tight'>
              <div className='text-slate-900'>Discover Unique</div>
              <div>
                <span className='text-orange-600'>Handcrafted Treasures</span>
              </div>
            </h1>

            <p className='text-lg text-slate-600'>
              Connect with talented artisans and find one-of-a-kind pieces that tell a story.
              Support local craftsmanship and sustainable consumption.
            </p>

            <div className='flex gap-4 pt-4'>
              <Link
                href='/shop'
                className='inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700'
              >
                Shop Now
                <span className='text-xl'>→</span>
              </Link>
              <Link
                href='/artisans'
                className='inline-flex items-center rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50'
              >
                Meet Our Artisans
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className='relative h-96 lg:h-full'>
            <Image
              src='/images/hero.webp'
              alt='Handcrafted ceramics and pottery'
              fill
              className='object-cover rounded-2xl'
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
