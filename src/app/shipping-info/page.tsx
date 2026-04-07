export default function ShippingInfoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold mb-6">Shipping Information</h1>

      <p className="text-slate-700 mb-4">
        We work with trusted carriers to ensure your handmade items arrive safely and on time.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Processing Time</h2>
      <p className="text-slate-700 mb-4">
        Most orders ship within <strong>2–5 business days</strong>. Custom or made‑to‑order items may
        require additional time.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Shipping Rates</h2>
      <p className="text-slate-700 mb-4">
        Shipping costs are calculated at checkout based on your location and the weight of your
        items.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Delivery Estimates</h2>
      <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
        <li>Standard Shipping: 5–10 business days</li>
        <li>Expedited Shipping: 2–4 business days</li>
        <li>International Shipping: 7–21 business days</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Tracking Your Order</h2>
      <p className="text-slate-700 mb-4">
        Once your order ships, you’ll receive a confirmation email with a tracking number.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Lost or Delayed Packages</h2>
      <p className="text-slate-700 mb-4">
        If your package is delayed or missing, contact us at{" "}
        <span className="font-semibold">support@handcraftedhaven.com</span> and we’ll assist you.
      </p>
    </main>
  );
}
