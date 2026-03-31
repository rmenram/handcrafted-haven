import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    artisanName: string;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart, isCartEnabled } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            artisanName: product.artisanName || "Artisan"
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:shadow-amber-900/5">
            <Link href={`/shop/${product._id}`} className="aspect-square overflow-hidden bg-slate-100">
                <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                        {product.category}
                    </span>
                    <Link href={`/shop/${product._id}`}>
                        <h3 className="mt-1 text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>
                
                <p className="mb-4 flex-1 text-sm text-slate-500 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <span className="text-lg font-bold text-slate-900">
                        UGX {product.price.toLocaleString()}
                    </span>
                    {isCartEnabled ? (
                        <button 
                            onClick={handleAddToCart}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 shadow-sm ${
                                added ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-amber-600"
                            }`}
                            type="button"
                            title={added ? "Added to cart" : "Add to cart"}
                        >
                            {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                        </button>
                    ) : (
                        <span 
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
                            title="Cart only for purchasers"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
