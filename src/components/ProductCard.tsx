'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  artisanName?: string;
  inStock?: boolean;
  stockQuantity?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isCartEnabled } = useCart();
  const stockQuantity = Number(product.stockQuantity ?? (product.inStock ? 1 : 0));
  const isOutOfStock = stockQuantity < 1;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  return (
    <Link
      href={`/shop/${product._id}`}
      className='product-card-link'
      aria-label={`View ${product.name}`}
    >
      <article className='product-card'>
        <div
          className='product-card-media'
          style={{ backgroundImage: `url(${product.image})` }}
        ></div>

        <div className='product-card-content'>
          <h2 className='product-card-title'>{product.name}</h2>
          <p className='product-card-category'>{product.category}</p>
          {isLowStock && (
            <p style={{ color: '#b45309', fontSize: '0.75rem', fontWeight: 600 }}>
              Only {stockQuantity} left
            </p>
          )}
          <p className='product-card-price'>${product.price.toFixed(2)}</p>
          {isCartEnabled && (
            <button
              className='product-card-button'
              type='button'
              onClick={(event) => {
                event.preventDefault();
                addToCart({
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  artisanName: '',
                });
              }}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </article>
    </Link>
  );
}
