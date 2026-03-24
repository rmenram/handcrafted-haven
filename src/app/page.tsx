import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function Home() {
  /* 
  // Temporary sample data until real DB/API is connected
  const sampleProducts = [
  {
    id: "1",
    name: "Handmade Mug",
    price: 24.99,
    image:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "2",
    name: "Woven Basket",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "3",
    name: "Wooden Spoon Set",
    price: 18.5,
    image:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
  }
]; */


  const sampleProducts = [
  {
      id: "1",
      name: "Handcrafted Ceramic Bowl Set",
      description: "Beautiful set of three nesting bowls, perfect for serving or display.",
      price: 89.99,
      rating: 4.9,
      reviews: 42,
      seller: "Emma Chen",
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
    },
    {
      id: "2",
      name: "Artisan Gold Necklace",
      description: "Elegant handcrafted necklace featuring ethically sourced materials.",
      price: 124.5,
      rating: 4.8,
      reviews: 36,
      seller: "Marcus Rodriguez",
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
    },
    {
      id: "3",
      name: "Handwoven Textile Wall Art",
      description: "Stunning wall hanging created using traditional weaving techniques.",
      price: 156.0,
      rating: 5.0,
      reviews: 28,
      seller: "Sarah Woodland",
      featured: true,
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60"
    },
  ];
  
  
  
  
  return (
    <section className='space-y-3'>
      <h1 className='text-3xl font-semibold tracking-tight'>Landing Page</h1>
      <p className='text-slate-600'>
        Base shell is ready. Next step is building real Header and Footer components.
      </p>
   
   <FeaturedProducts products={sampleProducts} />
    </section>
  );
}
