export default function FAQPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold mb-6">Frequently Asked Questions</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">What is Handcrafted Haven?</h2>
        <p className="text-slate-700">
          Handcrafted Haven is a marketplace that connects artisans with customers who value
          high‑quality, handmade goods.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How long does shipping take?</h2>
        <p className="text-slate-700">
          Standard shipping typically takes 5–10 business days. Expedited options are available at
          checkout.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Do you accept returns?</h2>
        <p className="text-slate-700">
          Yes — most items can be returned within 30 days. Visit our{" "}
          <a href="/return-policy" className="text-amber-600 hover:underline">
            Return Policy
          </a>{" "}
          page for details.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How do I contact customer support?</h2>
        <p className="text-slate-700">
          You can reach us anytime at{" "}
          <span className="font-semibold">support@handcraftedhaven.com</span>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Do you offer international shipping?</h2>
        <p className="text-slate-700">
          Yes — international shipping is available to most countries. Delivery times vary by
          location.
        </p>
      </section>
    </main>
  );
}
