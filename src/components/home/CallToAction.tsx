import Link from 'next/link';

export default function CallToAction() {
    return (
    // CTA Section
    <section className="py-20 bg-gradient-to-br from-amber-600 to-orange-600 text-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
      Are You an Artisan?
      </h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
      Join our community of talented creators. Share your craft with the world and 
      connect with customers who value handmade quality.
      </p>
      <Link
        href='/signup?role=artisan'
        className='inline-flex items-center rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-200/70'
      >
        Become a Seller
      </Link>          
    </div>
    </section>
  );
}