import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { title: name, description: `Buy ${name} at Apna Bazar — best prices, fast delivery.` };
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;
    const productName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // In production, fetch from DB. For now, static demo.
    const demoProduct = {
        name: productName,
        price: 299,
        mrp: 499,
        discount: 40,
        rating: 4.5,
        reviews: 128,
        brand: 'Apna Bazar',
        sku: 'AB-DEMO-001',
        inStock: true,
        description: 'This is a high-quality product available at Apna Bazar. Made with premium materials and designed for everyday use. Perfect as a gift or for personal enjoyment.',
        features: ['Premium Quality', 'Fast Delivery', 'Cash on Delivery Available', 'Easy Returns'],
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Breadcrumb */}
            <div className="px-4 py-3">
                <nav className="flex items-center gap-1 text-xs text-gray-500">
                    <Link href="/" className="hover:text-[#C41E3A]">Home</Link>
                    <ChevronRight size={12} />
                    <Link href="/categories" className="hover:text-[#C41E3A]">Products</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900 font-medium truncate">{productName}</span>
                </nav>
            </div>

            {/* Image gallery placeholder */}
            <div className="bg-white mx-3 rounded-2xl overflow-hidden shadow-sm mb-3">
                <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center relative">
                    <ShoppingCart size={48} className="text-gray-300" />
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md" aria-label="Add to wishlist">
                        <Heart size={18} className="text-gray-400" />
                    </button>
                    <button className="absolute top-3 right-14 p-2 bg-white rounded-full shadow-md" aria-label="Share">
                        <Share2 size={18} className="text-gray-400" />
                    </button>
                    {demoProduct.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-[#C41E3A] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {demoProduct.discount}% OFF
                        </span>
                    )}
                </div>
            </div>

            {/* Product info */}
            <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3">
                {demoProduct.brand && (
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{demoProduct.brand}</span>
                )}
                <h1 className="text-lg font-bold text-gray-900 mt-1">{demoProduct.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                        <Star size={10} className="fill-white" />
                        {demoProduct.rating}
                    </div>
                    <span className="text-xs text-gray-500">{demoProduct.reviews} Reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-2xl font-black text-gray-900">{formatPrice(demoProduct.price)}</span>
                    {demoProduct.mrp > demoProduct.price && (
                        <>
                            <span className="text-sm text-gray-400 line-through">{formatPrice(demoProduct.mrp)}</span>
                            <span className="text-sm text-green-600 font-semibold">{demoProduct.discount}% off</span>
                        </>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

                {/* Stock status */}
                <div className="mt-3">
                    {demoProduct.inStock ? (
                        <span className="text-green-600 text-sm font-semibold">✓ In Stock</span>
                    ) : (
                        <span className="text-red-600 text-sm font-semibold">✗ Out of Stock</span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3">
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{demoProduct.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3">
                <h2 className="font-semibold text-gray-900 mb-3">Highlights</h2>
                <ul className="space-y-2">
                    {demoProduct.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                            <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                            {f}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Trust badges */}
            <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Truck, text: 'Free Delivery', sub: 'Above ₹499' },
                        { icon: RefreshCw, text: 'Easy Returns', sub: 'No Questions' },
                        { icon: ShieldCheck, text: 'Original', sub: 'Guaranteed' },
                    ].map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div key={badge.text} className="text-center">
                                <Icon size={20} className="text-[#C41E3A] mx-auto mb-1" />
                                <div className="text-xs font-semibold text-gray-800">{badge.text}</div>
                                <div className="text-[10px] text-gray-500">{badge.sub}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky bottom bar */}
            <AddToCartButton productName={demoProduct.name} price={demoProduct.price} inStock={demoProduct.inStock} />
        </div>
    );
}
