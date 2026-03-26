'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Product } from '@/components/ProductCard';

type Params = { params: { id: string } };

export default function ProductDetailPage({ params }: Params) {
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
                const products = await res.json();
                const singleProduct = products.find((p: Product) => p._id === id);

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
            <main className="shop-root">
                <p>Loading...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="shop-root">
                <p>{error}</p>
                <Link href="/shop" className="link-back">
                    Back to shop
                </Link>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="shop-root">
                <p>Product not found.</p>
                <Link href="/shop" className="link-back">
                    Back to shop
                </Link>
            </main>
        );
    }

    return (
        <main className="shop-root">
            {product && (
                <section className="detail-card">
                    <img src={product.image} alt={product.name} className="detail-image" />
                    <div className="detail-content">
                        <p className="breadcrumbs">Shop / {product.category}</p>
                        <h1 className="detail-title">{product.name}</h1>
                        <p className="detail-description">{product.description}</p>
                        <p className="detail-price">UGX {product.price.toLocaleString()}</p>
                        <button className="product-card-button" type="button">
                            Add to Cart
                        </button>
                        <Link href="/shop" className="link-back">
                            Back to Marketplace
                        </Link>
                    </div>
                </section>
            )}
        </main>
    );
}
