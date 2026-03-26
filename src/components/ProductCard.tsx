
import Link from "next/link";

export interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/shop/${product._id}`} className="product-card-link" aria-label={`View ${product.name}`}>
            <article className="product-card">
                <div className="product-card-media" style={{ backgroundImage: `url(${product.image})` }}>
                </div>

                <div className="product-card-content">
                    <h2 className="product-card-title">{product.name}</h2>
                    <p className="product-card-category">{product.category}</p>
                    <p className="product-card-price">UGX {product.price.toLocaleString()}</p>
                    <button className="product-card-button" type="button">
                        Add to Cart
                    </button>
                </div>
            </article>
        </Link>
    );
}
