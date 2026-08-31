import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('name, description')
        .eq('slug', slug)
        .single();

    if (!product) {
        return { title: 'Product Not Found - Apna Bazar' };
    }

    return {
        title: `${product.name} | Apna Bazar`,
        description: product.description || `Buy ${product.name} at Apna Bazar — best prices, fast delivery.`
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch product with images
    const { data: productData, error } = await supabase
        .from('products')
        .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error || !productData) {
        notFound();
    }

    const product = productData as unknown as Product;

    const PrimaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
    const discountPercent = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;
    const inStock = product.stock_status !== 'out_of_stock' && product.stock_quantity > 0;

    return (
        <div className="bg-gray-50 min-h-screen pb-28">
            {/* Breadcrumb */}
            <div className="px-4 py-3">
                <nav className="flex items-center gap-1 text-[10px] text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={10} />
                    {product.category && (
                        <>
                            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
                            <ChevronRight size={10} />
                        </>
                    )}
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </nav>
            </div>

            {/* Image gallery */}
            <div className="bg-white mx-3 rounded-2xl overflow-hidden shadow-sm mb-3">
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                    {PrimaryImage ? (
                        <Image
                            src={PrimaryImage.url}
                            alt={PrimaryImage.alt_text ?? product.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            priority
                        />
                    ) : (
                        <ShoppingCart size={48} className="text-gray-300" />
                    )}

                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md z-10" aria-label="Add to wishlist">
                        <Heart size={18} className="text-gray-400" />
                    </button>
                    <button className="absolute top-3 right-14 p-2 bg-white rounded-full shadow-md z-10" aria-label="Share">
                        <Share2 size={18} className="text-gray-400" />
                    </button>
                    {discountPercent > 0 && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                            {discountPercent}% OFF
                        </span>
                    )}
                </div>
                {/* Thumbnails placeholder if more than 1 image exists */}
                {(product.images?.length ?? 0) > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                        {product.images?.map((img) => (
                            <div key={img.id} className={`w-16 h-16 rounded-xl border-2 flex-shrink-0 relative overflow-hidden ${img.is_primary ? 'border-primary' : 'border-transparent'}`}>
                                <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product info */}
            <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3">
                {product.brand && (
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">{product.brand}</span>
                )}
                <h1 className="text-lg font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>

                {/* Rating (Placeholder for now) */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        <Star size={10} className="fill-white" />
                        4.5
                    </div>
                    <span className="text-xs text-gray-500">128 Reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-2xl font-black text-gray-900">{formatPrice(product.price)}</span>
                    {product.mrp > product.price && (
                        <>
                            <span className="text-sm text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                            <span className="text-sm text-emerald-600 font-bold">{discountPercent}% off</span>
                        </>
                    )}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Inclusive of all taxes</p>

                {/* Stock status */}
                <div className="mt-3">
                    {inStock ? (
                        <div className="text-emerald-700 bg-emerald-50 text-xs font-bold px-2 py-1 inline-flex items-center gap-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock ({product.stock_quantity > 10 ? 'Available' : `Only ${product.stock_quantity} left`})
                        </div>
                    ) : (
                        <div className="text-red-700 bg-red-50 text-xs font-bold px-2 py-1 inline-flex items-center gap-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Out of Stock
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            {(product.description || (product.key_features && product.key_features.length > 0)) && (
                <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3">
                    <h2 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <span className="text-primary">📄</span> Description
                    </h2>
                    {product.description && (
                        <div
                            className="text-xs text-gray-600 leading-relaxed mb-4 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {product.key_features && Array.isArray(product.key_features) && product.key_features.length > 0 && (
                        <ul className="space-y-2 mt-3">
                            {product.key_features.map((f: unknown, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>{String(f)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Trust badges */}
            <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-3 border border-emerald-100">
                <div className="grid grid-cols-3 gap-3 divide-x divide-gray-100">
                    {[
                        { icon: Truck, text: 'Fast Delivery', sub: 'In Bajkul Area' },
                        { icon: RefreshCw, text: 'Easy Returns', sub: 'No Questions' },
                        { icon: ShieldCheck, text: 'Original', sub: 'Guaranteed' },
                    ].map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div key={badge.text} className="text-center px-1">
                                <Icon size={20} className="text-primary mx-auto mb-1.5" />
                                <div className="text-[10px] font-bold text-gray-800 leading-tight">{badge.text}</div>
                                <div className="text-[9px] text-gray-500 mt-0.5">{badge.sub}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky bottom bar */}
            <AddToCartButton product={product} />
        </div>
    );
}
