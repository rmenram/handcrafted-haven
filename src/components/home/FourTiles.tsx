import { Award, Heart, Leaf, Users } from "lucide-react";

export default function FourTiles() {
    return (
    // CTA Section
    <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
            <Users className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold">Talented Artisans</h3>
            <p className="text-sm text-gray-600">
            Connect with skilled creators from around the world
            </p>
        </div>
        <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
            <Award className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold">Quality Guaranteed</h3>
            <p className="text-sm text-gray-600">
            Each item is carefully crafted with attention to detail
            </p>
        </div>
        <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
            <Leaf className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold">Sustainable</h3>
            <p className="text-sm text-gray-600">
            Supporting eco-friendly practices and local economies
            </p>
        </div>
        <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
            <Heart className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold">Made with Love</h3>
            <p className="text-sm text-gray-600">
            Every piece tells a unique story and carries personal touch
            </p>
        </div>
        </div>
    </div>
    </section>
  );
}