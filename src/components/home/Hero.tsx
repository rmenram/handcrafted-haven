import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-base font-semibold uppercase tracking-wide text-slate-500 sm:text-lg lg:text-base xl:text-lg">
                Handcrafted Elegance
              </span>
              <span className="mt-1 block text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
                <span className="block text-slate-900">Artisan Jewelry</span>
                <span className="block text-amber-600">Made with Soul</span>
              </span>
            </h1>
            <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Discover unique, handcrafted beaded necklaces and jewelry pieces that tell a story. Each item is carefully crafted by local artisans using sustainable materials.
            </p>
            <div className="mt-8 sm:mx-auto sm:max-w-lg sm:text-center lg:mx-0 lg:text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-amber-600 px-8 py-3 text-base font-medium text-white hover:bg-amber-700 md:py-4 md:px-10 md:text-lg transition-colors"
                >
                  Shop the Collection
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-8 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 md:py-4 md:px-10 md:text-lg transition-colors"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>
          <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full overflow-hidden rounded-lg bg-white focus:outline-none">
                <Image
                  className="w-full object-cover"
                  src="/images/hero-necklace.webp"
                  alt="Beaded Necklace Artisan Piece"
                  width={600}
                  height={600}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
