"use client";

import { useMemo, useState, useEffect } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";
import { LayoutGrid, Loader2 } from "lucide-react";


export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [productsData, setProductsData] = useState<Product[]>([]);
    const [categoriesList, setCategoriesList] = useState<string[]>(["All"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/products/categories")
                ]);

                if (!productsRes.ok || !categoriesRes.ok) {
                    throw new Error("Failed to fetch shop data");
                }

                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();

                setProductsData(productsData.products || []);
                
                // Map the categories from objects to names
                const fetchedCategories = Array.isArray(categoriesData) 
                    ? categoriesData.map((c: { name: string }) => c.name)
                    : [];
                
                setCategoriesList(["All", ...fetchedCategories]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const products = useMemo(() => {
        if (!Array.isArray(productsData)) return [];
        if (activeCategory === "All") return productsData;
        return productsData.filter((p) => 
            p.category.toLowerCase() === activeCategory.toLowerCase()
        );
    }, [activeCategory, productsData]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Marketplace</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Discover Handcrafted Excellence
                </h1>
                <p className="max-w-2xl text-lg text-slate-600">
                    Explore our curated collection of unique, sustainable goods crafted by talented artisans from across the region.
                </p>
            </header>

            <div className="sticky top-[65px] z-40 -mx-4 bg-white/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-100">
                <FilterBar categories={categoriesList} active={activeCategory} onChange={setActiveCategory} />
            </div>

            <section aria-live="polite">
                {loading ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                        <p className="text-sm font-medium">Curating products for you...</p>
                    </div>
                ) : error ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
                        <p className="text-lg font-medium text-slate-900">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="text-amber-600 hover:text-amber-700 font-semibold"
                        >
                            Try again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                        <div className="mb-4 rounded-full bg-slate-50 p-4">
                            <LayoutGrid className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                        <p className="mt-1 text-slate-500">We couldn't find any products in the "{activeCategory}" category.</p>
                        <button 
                            onClick={() => setActiveCategory("All")}
                            className="mt-6 text-sm font-bold text-amber-600 hover:text-amber-700"
                        >
                            View all products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                        {products.map((product) => <ProductCard key={product._id} product={product} />)}
                    </div>
                )}
            </section>
        </div>
    );
}
