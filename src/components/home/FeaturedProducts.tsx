
import { Star, ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating: number;
  reviews: number;
  seller: string;
  featured?: boolean;
};

export default function FeaturedProducts({ products = [] }: { products?: Product[] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 space-y-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Featured Products</h2>
          <p className="text-slate-600">
            A curated selection of handcrafted items made with care and creativity.
          </p>
        </header>

        {products.length === 0 ? (
          <p className="text-slate-500">No featured products available.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
              >
                {/* Image wrapper (relative for badge positioning) */}
                <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-slate-400 text-sm">No image</span>
                  )}

                  {/* ⭐ Featured Badge (top-left) */}
                  {product.featured && (
                    <span
                      className="
                        absolute top-3 left-3
                        bg-yellow-400 text-yellow-900
                        text-xs font-medium
                        px-2 py-1 rounded-md shadow-sm
                      "
                    >
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-medium">{product.name}</h3>

                  <p className="text-slate-600 font-semibold">${product.price}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-sm text-slate-700">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {product.rating}
                    <span className="text-slate-500">({product.reviews})</span>
                  </div>

                  {/* Seller */}
                  <p className="text-xs text-slate-500">by {product.seller}</p>
                </div>

                {/* 🟧 Add Chip (bottom-right) */}
                <button
                  className="
                    absolute bottom-4 right-4
                    inline-flex items-center gap-1
                    px-3 py-1.5
                    bg-orange-500 text-white text-sm
                    rounded-full shadow-sm
                    hover:bg-orange-600 transition
                  "
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
