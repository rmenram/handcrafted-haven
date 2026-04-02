'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

type Params = { params: { id: string } };

export default function ProductDetailPage({ params }: Params) {
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist } = useCart();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products`);
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = (await res.json()) as { products?: Product[] };
        const singleProduct = (data.products ?? []).find((p: Product) => p._id === id);

        if (singleProduct) {
          setProduct(singleProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className='shop-root'>
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className='shop-root'>
        <p>{error}</p>
        <Link href='/shop' className='link-back'>
          Back to shop
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className='shop-root'>
        <p>Product not found.</p>
        <Link href='/shop' className='link-back'>
          Back to shop
        </Link>
      </main>
    );
  }

  const stockQuantity = Number(product.stockQuantity ?? (product.inStock ? 1 : 0));
  const isOutOfStock = stockQuantity < 1;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  return (
    <main className='shop-root'>
      {product && (
        <section className='detail-card'>
          <div className='detail-image' style={{ position: 'relative', overflow: 'hidden' }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 50vw'
            />
          </div>
          <div className='detail-content'>
            <p className='breadcrumbs'>Shop / {product.category}</p>
            <h1 className='detail-title'>{product.name}</h1>
            <p className='detail-description'>{product.description}</p>
            <p className='detail-price'>UGX {product.price.toLocaleString()}</p>
            {isLowStock && (
              <p className='text-sm font-semibold text-amber-700'>Only {stockQuantity} left</p>
            )}
            {isCartEnabled && (
              <>
                <button
                  className='product-card-button'
                  type='button'
                  onClick={() =>
                    addToCart({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      artisanName: '',
                    })
                  }
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  className='product-card-button'
                  type='button'
                  onClick={() =>
                    toggleWishlist({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      artisanName: '',
                    })
                  }
                >
                  <Heart className='inline h-4 w-4 mr-2' />
                  {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </>
            )}
            <Link href='/shop' className='link-back'>
              Back to Marketplace
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
