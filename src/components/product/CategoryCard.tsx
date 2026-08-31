'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryCardProps {
    category: Category;
    className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    jewelry: 'from-yellow-100 to-amber-50',
    bangles: 'from-pink-100 to-rose-50',
    earrings: 'from-purple-100 to-violet-50',
    rings: 'from-yellow-100 to-orange-50',
    cosmetics: 'from-pink-100 to-fuchsia-50',
    makeup: 'from-rose-100 to-pink-50',
    'skin care': 'from-green-100 to-emerald-50',
    'hair care': 'from-blue-100 to-sky-50',
    perfumes: 'from-violet-100 to-purple-50',
    gifts: 'from-red-100 to-rose-50',
    'gift items': 'from-red-100 to-rose-50',
    toys: 'from-yellow-100 to-lime-50',
    stationery: 'from-blue-100 to-indigo-50',
    food: 'from-orange-100 to-amber-50',
    grocery: 'from-green-100 to-teal-50',
    'personal care': 'from-teal-100 to-cyan-50',
};

function getCategoryBg(name: string): string {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
        if (key.includes(k)) return v;
    }
    return 'from-gray-100 to-slate-50';
}

export function CategoryCard({ category, className }: CategoryCardProps) {
    const bg = getCategoryBg(category.name);

    return (
        <Link
            href={`/categories/${category.slug}`}
            className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95',
                className
            )}
            aria-label={`Browse ${category.name}`}
        >
            {/* Icon container */}
            <div
                className={cn(
                    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center overflow-hidden shadow-sm',
                    bg
                )}
            >
                {category.image_url ? (
                    <Image
                        src={category.image_url}
                        alt={category.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full rounded-2xl"
                    />
                ) : (
                    <span className="text-3xl select-none" aria-hidden>
                        {getCategoryEmoji(category.name)}
                    </span>
                )}
            </div>
            {/* Label */}
            <span className="text-[11px] font-semibold text-center text-gray-700 leading-tight w-full truncate text-center">
                {category.name}
            </span>
        </Link>
    );
}

function getCategoryEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('jewelry') || n.includes('jewel')) return '💎';
    if (n.includes('bangle')) return '🔮';
    if (n.includes('earring')) return '👂';
    if (n.includes('ring')) return '💍';
    if (n.includes('makeup') || n.includes('cosmetic')) return '💄';
    if (n.includes('skin')) return '🧴';
    if (n.includes('hair')) return '💆';
    if (n.includes('perfume') || n.includes('fragrance')) return '🌸';
    if (n.includes('gift')) return '🎁';
    if (n.includes('toy')) return '🧸';
    if (n.includes('stationery') || n.includes('pen')) return '🖊️';
    if (n.includes('food') || n.includes('grocery')) return '🛒';
    if (n.includes('birthday')) return '🎂';
    return '🏪';
}

// Skeleton
export function CategoryCardSkeleton() {
    return (
        <div className="flex flex-col items-center gap-2 p-3">
            <div className="skeleton w-16 h-16 rounded-2xl" />
            <div className="skeleton h-3 w-12 rounded" />
        </div>
    );
}
