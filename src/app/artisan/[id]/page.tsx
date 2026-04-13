'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Star, Calendar, ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';

type Artisan = {
  id: string;
  name: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  specialties: string[];
  memberSince: string;
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
  stockQuantity?: number;
};

type ArtisanApi = Omit<Artisan, 'id'> & {
  _id: string;
};

type ProductApi = Omit<Product, 'id' | 'artisanId'> & {
  _id: string;
  artisanUserId: string;
};

export default function ArtisanProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist } = useCart();

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

  const artisan = artisans.find((a) => a.id === id);
  const artisanProducts = products.filter((p) => p.artisanId.toString() === id);

  if (!artisan) {
    return (
      <div className='container mx-auto px-4 py-16 text-center'>
        <h2 className='text-2xl font-bold mb-4'>Artisan not found</h2>
        <button type='button' onClick={() => navigate.push('/artisans')}>
          Back to Artisans
        </button>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <button
        type='button'
        className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 px-4 py-3'
        onClick={() => navigate.back()}
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back
      </button>

      {/* Artisan Header */}
      <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-12'>
        <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
          <Image
            src={artisan.profileImage || '/images/avatar-placeholder.webp'}
            alt={artisan.name}
            width={128}
            height={128}
            unoptimized
            className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg'
          />
          <div className='flex-1 text-center md:text-left'>
            <h1 className='text-4xl font-bold mb-2'>{artisan.name}</h1>
            <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-gray-600'>
              <div className='flex items-center'>
                <MapPin className='h-4 w-4 mr-1' />
                {artisan.location}
              </div>
              <div className='flex items-center'>
                <Star className='h-4 w-4 mr-1 fill-amber-400 text-amber-400' />
                {artisan.artisanRating} rating
              </div>
              <div className='flex items-center'>
                <Calendar className='h-4 w-4 mr-1' />
                Member since {new Date(artisan.memberSince).getFullYear()}
              </div>
            </div>
            <div className='flex flex-wrap gap-2 justify-center md:justify-start mb-4'>
              {artisan.specialties?.map((specialty) => (
                // <Badge key={specialty} className="bg-amber-600">
                //   {specialty}
                // </Badge>
                <div
                  key={specialty}
                  className='bg-amber-600 text-white inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0'
                >
                  {specialty}
                </div>
              ))}
            </div>
            <p className='text-gray-700 max-w-2xl'>{artisan.bio}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold mb-2'>Products by {artisan.name}</h2>
        <p className='text-gray-600'>
          {artisanProducts.length} {artisanProducts.length === 1 ? 'item' : 'items'} available
        </p>
      </div>

      {artisanProducts.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {artisanProducts.map((product) => (
            // Card
            <article
              key={product.id}
              className='group overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-shadow duration-300'
            >
              <div className='relative overflow-hidden aspect-square bg-gray-100'>
                <Image
                  src={product.image || '/images/product-placeholder.webp'}
                  alt={product.name}
                  fill
                  sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                  unoptimized
                  className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
                />
                {product.featured && (
                  // badge
                  <div className='absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-white shadow-sm'>
                    Featured
                  </div>
                )}
                {isCartEnabled && (
                  <>
                    <button
                      type='button'
                      className='absolute top-2 right-2 rounded-md inline-flex h-8 w-8 items-center justify-center opacity-0 border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-200  group-hover:opacity-100 transition-opacity'
                      onClick={() =>
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          artisanName: product.artisanName,
                        })
                      }
                      aria-label={`Toggle ${product.name} in wishlist`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </>
                )}
              </div>
              {/* Card Content */}
              <div className='p-4'>
                <div className='space-y-2'>
                  <div className='flex items-start justify-between'>
                    <h3 className='font-semibold line-clamp-1'>{product.name}</h3>
                  </div>
                  <p className='text-sm text-gray-600 line-clamp-2'>{product.description}</p>
                  <div className='flex items-center space-x-1'>
                    <div className='flex items-center'>
                      <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
                      <span className='text-sm ml-1'>{product.rating}</span>
                    </div>
                    <span className='text-sm text-gray-500'>({product.reviewCount})</span>
                  </div>
                  <p className='text-xs text-gray-500'>by {product.artisanName}</p>
                </div>
              </div>
              {/* Card Footer */}
              <div className='p-4 pt-0 flex items-center justify-between'>
                <div className='flex flex-col'>
                  <span className='text-2xl font-bold'>${product.price.toFixed(2)}</span>
                  {!product.inStock && <span className='text-xs text-red-500'>Out of stock</span>}
                </div>
                {isCartEnabled && (
                  <>
                    <button
                      type='button'
                      className='inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600'
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          artisanName: product.artisanName,
                        })
                      }
                      disabled={Number(product.stockQuantity ?? 0) < 1}
                    >
                      <ShoppingCart className='h-4 w-4' />
                      {Number(product.stockQuantity ?? 0) < 1 ? 'Out' : 'Add'}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className='text-center py-16'>
          <p className='text-gray-500 text-lg'>This artisan has not listed any products yet</p>
        </div>
      )}
    </div>
  );
}
