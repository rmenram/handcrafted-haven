"use client";

import { useMemo, useState, useEffect } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";

const categories = ["All", "Jewelry", "Baskets", "Tableware", "Decor"];

export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [productsData, setProductsData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) {
                    throw new Error("Failed to fetch products");
                }
                const data = await res.json();
                setProductsData(data.products || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const products = useMemo(() => {
        if (!Array.isArray(productsData)) return [];
        if (activeCategory === "All") return productsData;
        return productsData.filter((p) => p.category === activeCategory);
    }, [activeCategory, productsData]);

    return (
        <main className="shop-root">
            <nav className="top-nav" aria-label="Main">
                <a href="/" className="nav-logo">
                    Handcrafted Haven
                </a>
                <div className="nav-links">
                    <a href="/shop">Shop</a>
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>
                </div>
            </nav>

            <header className="shop-header">
                <p className="breadcrumbs">Home / Shop</p>
                <h1 className="shop-title">Marketplace</h1>
                <p className="shop-subtitle">Discover handcrafted goods with sustainable style.</p>
            </header>

            <section className="shop-controls">
                <FilterBar categories={categories} active={activeCategory} onChange={setActiveCategory} />
            </section>

            <section className="products-grid" aria-live="polite">
                {loading ? (
                    <p className="empty-state">Loading products...</p>
                ) : error ? (
                    <p className="empty-state">{error}</p>
                ) : products.length === 0 ? (
                    <p className="empty-state">No products found in this category.</p>
                ) : (
                    products.map((product) => <ProductCard key={product._id} product={product} />)
                )}
            </section>
        </main >
    );
}
