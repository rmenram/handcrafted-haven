export default function ReturnPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold mb-6">Return Policy</h1>

      <p className="text-slate-700 mb-4">
        At Handcrafted Haven, we want you to love every handmade item you purchase. If something
        isn’t quite right, we’re here to help.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Eligibility for Returns</h2>
      <p className="text-slate-700 mb-4">
        You may request a return within <strong>30 days</strong> of receiving your order. Items must
        be unused, in their original condition, and in their original packaging.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Non‑Returnable Items</h2>
      <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
        <li>Custom or personalized items</li>
        <li>Digital products</li>
        <li>Gift cards</li>
        <li>Final‑sale or clearance items</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Refunds</h2>
      <p className="text-slate-700 mb-4">
        Once your return is received and inspected, we’ll issue a refund to your original payment
        method. Refunds typically take <strong>5–7 business days</strong> to process.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Return Shipping</h2>
      <p className="text-slate-700 mb-4">
        Customers are responsible for return shipping costs unless the item arrived damaged or
        incorrect.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Damaged or Incorrect Items</h2>
      <p className="text-slate-700 mb-4">
        If your order arrives damaged or you receive the wrong item, contact us within{' '}
        <strong>7 days</strong> and we’ll make it right at no cost to you.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p className="text-slate-700">
        For return requests or questions, email us at{' '}
        <span className="font-semibold">support@handcraftedhaven.com</span>.
      </p>
    </main>
  );
}
