import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <section className='mx-auto max-w-6xl space-y-24 px-4 py-16'>
      <section className='space-y-6 text-center'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Our Mission: Celebrating Handcrafted Excellence
        </h1>
        <p className='mx-auto max-w-3xl text-lg text-slate-600'>
          Handcrafted Haven is more than a marketplace. It is a community that brings together
          passionate artisans and conscious consumers who value quality, sustainability, and the
          human touch in every creation.
        </p>
      </section>

      <section className='grid items-center gap-12 lg:grid-cols-2'>
        <div className='space-y-6'>
          <h2 className='text-3xl font-semibold'>Our Story</h2>
          <p className='leading-relaxed text-slate-600'>
            Founded in 2022, Handcrafted Haven was born from a simple belief: handmade goods have
            unique value that mass-produced items can never match. Each piece tells a story of
            dedication, skill, and care.
          </p>
          <p className='leading-relaxed text-slate-600'>
            We created this platform to connect talented artisans with customers who appreciate the
            beauty of handmade work. Our marketplace supports traditional craftsmanship while
            embracing modern e-commerce convenience.
          </p>
          <p className='leading-relaxed text-slate-600'>
            Today, we are proud to work with artisans from around the world, offering unique
            products across multiple categories.
          </p>
        </div>

        <div className='overflow-hidden rounded-xl shadow-md'>
          <Image
            src='https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60'
            alt='Artisan workshop'
            width={900}
            height={600}
            className='h-full w-full object-cover'
          />
        </div>
      </section>

      <section className='space-y-8'>
        <header className='space-y-2 text-center'>
          <h2 className='text-3xl font-semibold'>Our Values</h2>
          <p className='text-slate-600'>
            Everything we do is guided by our core values and commitment to our artisan community.
          </p>
        </header>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <h3 className='text-lg font-semibold'>Community First</h3>
            <p className='mt-2 text-sm text-slate-600'>
              We foster a supportive community where artisans and customers connect meaningfully.
            </p>
          </div>

          <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <h3 className='text-lg font-semibold'>Quality Craftsmanship</h3>
            <p className='mt-2 text-sm text-slate-600'>
              Every item is handcrafted with exceptional skill and attention to detail.
            </p>
          </div>

          <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <h3 className='text-lg font-semibold'>Sustainability</h3>
            <p className='mt-2 text-sm text-slate-600'>
              We promote eco-friendly practices and support local, sustainable production.
            </p>
          </div>

          <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <h3 className='text-lg font-semibold'>Made with Care</h3>
            <p className='mt-2 text-sm text-slate-600'>
              Every piece carries the passion and dedication of its creator.
            </p>
          </div>
        </div>
      </section>

      <section className='space-y-8 text-center'>
        <h2 className='text-3xl font-semibold'>Our Impact</h2>
        <p className='mx-auto max-w-2xl text-slate-600'>
          Together, we are making a difference in the lives of artisans and their communities.
        </p>

        <div className='grid gap-8 sm:grid-cols-3'>
          <div className='space-y-2'>
            <p className='text-4xl font-bold'>$2M+</p>
            <p className='text-sm text-slate-600'>Paid to artisans in 2025</p>
          </div>
          <div className='space-y-2'>
            <p className='text-4xl font-bold'>10K+</p>
            <p className='text-sm text-slate-600'>Happy customers worldwide</p>
          </div>
          <div className='space-y-2'>
            <p className='text-4xl font-bold'>50+</p>
            <p className='text-sm text-slate-600'>Communities supported</p>
          </div>
        </div>
      </section>

      <section className='space-y-6 text-center'>
        <h2 className='text-3xl font-semibold'>Join Our Community</h2>
        <p className='mx-auto max-w-2xl text-slate-600'>
          Whether you are an artisan looking to share your craft or a customer seeking unique,
          handmade treasures, there is a place for you at Handcrafted Haven.
        </p>

        <div className='flex justify-center gap-4'>
          <Link
            href='/shop'
            className='rounded-lg bg-black px-6 py-3 text-white transition hover:bg-slate-800'
          >
            Start Shopping
          </Link>
          <Link
            href='/signup'
            className='rounded-lg border px-6 py-3 transition hover:bg-slate-100'
          >
            Create an Account
          </Link>
        </div>
      </section>
    </section>
  );
}
