'use client';

import { use, useEffect, useState } from 'react';
import Link from "next/link";
import { Product } from '@/components/ProductCard';
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

type Params = { params: Promise<{ id: string }> };

export default function ProductDetailPage({ params }: Params) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart, isCartEnabled } = useCart();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchProduct() {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to fetch product');
                }
                const data = await res.json();
                setProduct(data.product);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            artisanName: product.artisanName || "Artisan"
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-2xl font-bold text-slate-900">{error || 'Product not found'}</h2>
                <Link 
                    href="/shop" 
                    className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <Link 
                href="/shop" 
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to Marketplace
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="flex flex-col justify-center">
                    <div className="mb-6">
                        <span className="mb-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{product.name}</h1>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">{product.description}</p>
                    </div>

                    <div className="mb-8">
                        <p className="text-3xl font-bold text-amber-600">UGX {product.price.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {isCartEnabled ? (
                            <button 
                                onClick={handleAddToCart}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                    added ? "bg-green-600 shadow-green-600/20" : "bg-amber-600 shadow-amber-600/20 hover:bg-amber-700 hover:shadow-amber-600/30"
                                }`}
                                type="button"
                            >
                                {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                                {added ? "Added to Cart" : "Add to Cart"}
                            </button>
                        ) : (
                            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-8 py-4 text-base font-bold text-slate-400 cursor-not-allowed border border-slate-200">
                                <ShoppingCart className="h-5 w-5" />
                                Cart for Purchasers Only
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
