'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Package } from 'lucide-react';

type Artisan = {
  id: string;
  name: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  specialties: string[];
  memberSince?: string | null;
  artisanRating?: number;
  productCount?: number | 0;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  artisanId: string;
  artisanName: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured?: boolean;
  materials?: string[];
  customizable?: boolean;
};

type ArtisanApi = Omit<Artisan, 'id'> & {
  _id: string;
};

type ProductApi = Omit<Product, 'id' | 'artisanId'> & {
  _id: string;
  artisanUserId: string;
};

export default function Artisans() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Ensure loading is set at start

        // Fetch both endpoints concurrently
        const [artisansResponse, productsResponse] = await Promise.all([
          fetch('/api/artisans'),
          fetch('/api/products'),
        ]);

        // Check if both responses are okay
        if (!artisansResponse.ok || !productsResponse.ok) {
          throw new Error('One or more network requests failed');
        }

        const artisansData = (await artisansResponse.json()) as { artisans: ArtisanApi[] };
        const productsData = (await productsResponse.json()) as { products: ProductApi[] };

        // Map _id to id
        const formattedArtisans = artisansData.artisans.map((a) => ({
          ...a,
          id: a._id,
        }));

        // Map _id to id
        const formattedProducts = productsData.products.map((a) => ({
          ...a,
          id: a._id,
          artisanId: a.artisanUserId,
        }));

        setArtisans(formattedArtisans || []);
        setProducts(formattedProducts || []);
      } catch (error) {
        console.error('Fetch failed', error);
        //  set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-12 text-center max-w-3xl mx-auto'>
        <h1 className='text-4xl font-bold mb-4'>Meet Our Artisans</h1>
        <p className='text-lg text-gray-600'>
          Discover the talented creators behind our handcrafted treasures. Each artisan brings their
          unique vision, skill, and passion to every piece they create.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {artisans.map((artisan) => {
          // console.log(products);
          const artisanProducts = products.filter((p) => p.artisanId === artisan.id).slice(0, 3);
          // console.log(artisan.id);
          // console.log(artisanProducts);
          return (
            <div
              key={artisan.id}
              className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border overflow-hidden hover:shadow-lg transition-shadow'
            >
              <div className='p-6'>
                <div className='flex items-start space-x-4 mb-4'>
                  <Image
                    src={artisan.profileImage || '/images/avatar-placeholder.webp'}
                    alt={artisan.name}
                    width={64}
                    height={64}
                    unoptimized
                    className='w-16 h-16 rounded-full object-cover'
                  />
                  <div className='flex-1'>
                    <h3 className='font-bold text-xl mb-1'>{artisan.name}</h3>
                    <div className='flex items-center text-sm text-gray-600 mb-2'>
                      <MapPin className='h-3 w-3 mr-1' />
                      {artisan.location}
                    </div>
                    <div className='flex items-center space-x-4 text-sm'>
                      <div className='flex items-center'>
                        <Star className='h-4 w-4 fill-amber-400 text-amber-400 mr-1' />
                        <span>{artisan.artisanRating}</span>
                      </div>
                      <div className='flex items-center text-gray-600'>
                        <Package className='h-4 w-4 mr-1' />
                        <span>{artisan.productCount} items</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className='text-sm text-gray-600 mb-4 line-clamp-3'>{artisan.bio}</p>

                <div className='flex flex-wrap gap-2 mb-4'>
                  {artisan.specialties?.map((specialty) => (
                    <div
                      key={specialty}
                      className='inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0'
                    >
                      {specialty}
                    </div>
                  ))}
                </div>

                <div className='grid grid-cols-3 gap-2 mb-4'>
                  {artisanProducts.map((product) => (
                    <Link
                      key={product.id}
                      href='#'
                      onClick={(e) => e.preventDefault()}
                      className='relative cursor-default aspect-square rounded-md overflow-hidden bg-gray-100 hover:opacity-75 transition-opacity'
                    >
                      <Image
                        src={product.image || '/images/product-placeholder.webp'}
                        alt={product.name}
                        fill
                        sizes='(min-width: 1024px) 12vw, (min-width: 768px) 16vw, 25vw'
                        unoptimized
                        className='w-full h-full object-cover'
                      />
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/artisan/${artisan.id}`}
                  className='w-full inline-flex justify-center text-sm font-medium rounded-lg border-1 px-4 py-2 hover:bg-input-background transition-colors'
                >
                  View Profile
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-12 text-center'>
        <h2 className='text-3xl font-bold mb-4'>Become an Artisan Partner</h2>
        <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
          Join our community of talented creators. Share your craft with customers who value
          quality, sustainability, and the human touch in every creation.
        </p>
        <Link
          href='/signup?role=artisan'
          className='inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700'
        >
          Apply to Sell
        </Link>
      </div>
    </div>
  );
}
