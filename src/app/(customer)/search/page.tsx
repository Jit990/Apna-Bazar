'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types';

import { Suspense } from 'react';

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Debounce the query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            // update URL
            if (query.trim().length > 2) {
                router.replace(`/search?q=${encodeURIComponent(query)}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, router]);

    // Fetch products when query changes
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
                setProducts([]);
                setSearched(false);
                return;
            }

            setLoading(true);
            setSearched(true);
            try {
                const res = await fetch(`/api/products?q=${encodeURIComponent(debouncedQuery)}&limit=20`);
                const json = await res.json();
                if (json.success && json.data?.data) {
                    setProducts(json.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [debouncedQuery]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-3 pb-4 safe-top">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>

                    <div className="flex-1 relative flex items-center">
                        <SearchIcon size={20} className="absolute left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products, brands, categories..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1A7850] outline-none font-medium"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 text-gray-400 hover:text-gray-700 text-xs font-semibold"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-[#1A7850]" />
                        <p className="text-sm font-medium">Searching amazing products...</p>
                    </div>
                ) : searched && products.length === 0 ? (
                    <div className="empty-state">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <SearchIcon size={32} className="text-gray-400" />
                        </div>
                        <h2 className="empty-state-title">No products found</h2>
                        <p className="empty-state-desc">We couldn&apos;t find anything matching &quot;{debouncedQuery}&quot;.</p>
                        <button
                            onClick={() => router.push('/categories')}
                            className="btn-outline mt-6 rounded-xl border-[#1A7850] text-[#1A7850]"
                        >
                            Browse Categories
                        </button>
                    </div>
                ) : products.length > 0 ? (
                    <div className="animate-fade-in">
                        <h2 className="text-sm font-semibold text-gray-500 mb-4 px-1">
                            Found {products.length} results for &quot;{debouncedQuery}&quot;
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-12 px-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Trending Searches</h2>
                        <div className="flex flex-wrap gap-2">
                            {['Milk', 'Bread', 'Eggs', 'Rice', 'Snacks', 'Chocolates'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setQuery(term)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#1A7850] hover:text-[#1A7850] transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20"><Loader2 size={32} className="animate-spin text-[#1A7850]" /></div>}>
            <SearchContent />
        </Suspense>
    );
}
