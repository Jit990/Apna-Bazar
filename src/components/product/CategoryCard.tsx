'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';
import {
    Gem, ScanFace, SprayCan, Sparkles, Droplets, Scissors,
    Gift, ToyBrick, PenTool, ShoppingBasket,
    Package, Heart
} from 'lucide-react';

interface CategoryCardProps {
    category: Category;
    className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
    return (
        <Link
            href={`/categories/${category.slug}`}
            className={cn(
                'flex flex-col items-center gap-2 py-3 px-1 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 group',
                className
            )}
            aria-label={`Browse ${category.name}`}
        >
            {/* Icon container */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:bg-emerald-100 transition-colors">
                {category.image_url ? (
                    <Image
                        src={category.image_url}
                        alt={category.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full rounded-xl"
                    />
                ) : (
                    <CategoryFallbackIcon name={category.name} />
                )}
            </div>
            {/* Label */}
            <span className="text-[11px] font-semibold text-center text-gray-700 leading-tight w-full line-clamp-2 px-1">
                {category.name}
            </span>
        </Link>
    );
}

function CategoryFallbackIcon({ name }: { name: string }) {
    const n = name.toLowerCase();

    let Icon = Package;
    if (n.includes('jewelry') || n.includes('ring') || n.includes('earring') || n.includes('bangle')) Icon = Gem;
    else if (n.includes('makeup') || n.includes('cosmetic')) Icon = ScanFace;
    else if (n.includes('skin')) Icon = Droplets;
    else if (n.includes('hair')) Icon = Scissors;
    else if (n.includes('perfume') || n.includes('fragrance')) Icon = SprayCan;
    else if (n.includes('gift')) Icon = Gift;
    else if (n.includes('toy')) Icon = ToyBrick;
    else if (n.includes('stationery') || n.includes('pen')) Icon = PenTool;
    else if (n.includes('food') || n.includes('grocery')) Icon = ShoppingBasket;
    else if (n.includes('beauty')) Icon = Sparkles;
    else if (n.includes('personal') || n.includes('care')) Icon = Heart;

    return <Icon size={24} strokeWidth={1.5} className="text-primary opacity-80" />;
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
