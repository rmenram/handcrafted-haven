import Link from 'next/link';
import Image from 'next/image';

type Category = {
  name: string;
  productCount: number;
};

const categoryImages: Record<string, string> = {
  Jewelry: '/images/jewelry.jpg',
  Ceramics: '/images/ceramics.jpg',
  Textiles: '/images/textiles.jpg',
  Woodwork: '/images/woodwork.jpg',
};

export default function BrowseByCategory({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Browse by Category</h2>
        <p className="text-gray-600">
          Explore our diverse collection of handcrafted items
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/category/${category.name}`}
            className="group relative rounded-xl overflow-hidden shadow-lg"
          >
            <div className="aspect-[4/3] relative">
                    <Image
                        src={categoryImages[category.name] || '/images/default.jpg'}
                        alt={category.name} fill
                        className="object-cover group-hover:scale-110 transition duration-500"/>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-xl font-bold">{category.name}</h3>
                <p className="text-sm opacity-80">
                  {category.productCount} products
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}