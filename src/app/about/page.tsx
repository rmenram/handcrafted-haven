export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 space-y-24">
      {/* Mission Section */}
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Our Mission: Celebrating Handcrafted Excellence
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Handcrafted Haven is more than a marketplace—it’s a community that brings
          together passionate artisans and conscious consumers who value quality,
          sustainability, and the human touch in every creation.
        </p>
      </section>

      {/* Our Story */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold">Our Story</h2>
          <p className="text-slate-600 leading-relaxed">
            Founded in 2022, Handcrafted Haven was born from a simple belief: that
            handmade goods have unique value that mass‑produced items can never match.
            Each piece tells a story of dedication, skill, and love.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We created this platform to connect talented artisans with customers who
            appreciate the beauty of handmade work. Our marketplace supports traditional
            craftsmanship while embracing modern e‑commerce convenience.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Today, we’re proud to work with over 50 artisans from around the world,
            offering hundreds of unique products across multiple categories. Every
            purchase supports sustainable practices and helps preserve traditional craft
            techniques.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
            alt="Artisan workshop"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Values */}
      <section className="space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-semibold">Our Values</h2>
          <p className="text-slate-600">
            Everything we do is guided by our core values and commitment to our artisan community.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="font-semibold text-lg">Community First</h3>
            <p className="text-slate-600 text-sm mt-2">
              We foster a supportive community where artisans and customers connect meaningfully.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="font-semibold text-lg">Quality Craftsmanship</h3>
            <p className="text-slate-600 text-sm mt-2">
              Every item is handcrafted with exceptional skill and attention to detail.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="font-semibold text-lg">Sustainability</h3>
            <p className="text-slate-600 text-sm mt-2">
              We promote eco‑friendly practices and support local, sustainable production.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="font-semibold text-lg">Made with Love</h3>
            <p className="text-slate-600 text-sm mt-2">
              Every piece carries the passion and dedication of its creator.
            </p>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="space-y-8 text-center">
        <h2 className="text-3xl font-semibold">Our Impact</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Together, we’re making a difference in the lives of artisans and their communities.
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <p className="text-4xl font-bold">$2M+</p>
            <p className="text-slate-600 text-sm">Paid to artisans in 2025</p>
          </div>

          <div className="space-y-2">
            <p className="text-4xl font-bold">10K+</p>
            <p className="text-slate-600 text-sm">Happy customers worldwide</p>
          </div>

          <div className="space-y-2">
            <p className="text-4xl font-bold">50+</p>
            <p className="text-slate-600 text-sm">Communities supported</p>
          </div>
        </div>
      </section>

      {/* Join Community */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-semibold">Join Our Community</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Whether you’re an artisan looking to share your craft or a customer seeking
          unique, handmade treasures, there’s a place for you at Handcrafted Haven.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/shop"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-slate-800 transition"
          >
            Start Shopping
          </a>
          <a
            href="/sell"
            className="px-6 py-3 border rounded-lg hover:bg-slate-100 transition"
          >
            Become a Seller
          </a>
        </div>
      </section>
    </main>
  );
}

