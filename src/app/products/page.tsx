import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";

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

export default async function ProductsPage() {
  // Later: fetch from DB
  const products: Product[] = [
    {
      id: "1",
      name: "Handcrafted Ceramic Bowl Set",
      price: 89.99,
      image: "/placeholder.jpg",
      rating: 4.9,
      reviews: 42,
      seller: "Emma Chen",
      featured: true,
    },
    {
      id: "2",
      name: "Artisan Gold Necklace",
      price: 124.5,
      image: "/placeholder.jpg",
      rating: 4.8,
      reviews: 36,
      seller: "Marcus Rodriguez",
    },
    
  ];

  return (
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-4 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">All Products</h1>
          <p className="text-slate-600">
            Explore our full collection of handcrafted items made with passion and creativity.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-slate-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                    No image
                  </div>
                )}

                {product.featured && (
                  <span className="absolute left-3 top-3 rounded-md bg-yellow-400 px-2 py-1 text-xs font-medium text-yellow-900 shadow-sm">
                    Featured
                  </span>
                )}
              </div>

              <div className="space-y-3 p-5">
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="font-semibold text-slate-600">${product.price.toFixed(2)}</p>

                <div className="flex items-center gap-1 text-sm text-slate-700">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {product.rating.toFixed(1)}
                  <span className="text-slate-500">({product.reviews})</span>
                </div>

                <p className="text-xs text-slate-500">by {product.seller}</p>
              </div>

              <button
                type="button"
                className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600"
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
