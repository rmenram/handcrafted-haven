import Link from 'next/link';
import Image from 'next/image';

type Category = {
  name: string;
  productCount: number;
  image?: string;
};

const categoryImages: Record<string, string> = {
  'Home Decor': '/images/home-decor.webp',
  Jewelry: '/images/jewelry.webp',
  Kitchen: '/images/kitchen.webp',
  'Pottery & Ceramics': '/images/ceramics.webp',
  Stationery: '/images/stationery.webp',
  'Textiles & Fabrics': '/images/textiles.webp',
};

export default function BrowseByCategory({ categories }: { categories: Category[] }) {
  return (
    <section className='py-12'>
      <div className='text-center mb-10'>
        <h2 className='text-3xl font-bold'>Browse by Category</h2>
        <p className='text-gray-600'>Explore our diverse collection of handcrafted items</p>
      </div>

      <div className='grid md:grid-cols-3 gap-6'>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/category/${encodeURIComponent(category.name)}`}
            className='group relative rounded-xl overflow-hidden shadow-lg'
          >
            <div className='aspect-[4/3] relative'>
              <Image
                src={category.image || categoryImages[category.name] || '/images/home-decor.webp'}
                alt={category.name}
                fill
                className='object-cover group-hover:scale-110 transition duration-500'
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent' />

              <div className='absolute bottom-0 p-5 text-white w-full'>
                <div className='flex flex-col justify-between h-full'>
                  <h3 className='text-xl font-bold'>{category.name}</h3>
                  <div className='flex justify-between items-end'>
                    <p className='text-sm opacity-80'>{category.productCount} products</p>
                    <span className='text-sm font-medium'>Explore →</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
